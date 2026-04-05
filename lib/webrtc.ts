'use client'

import type { Socket } from 'socket.io-client'

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

interface PeerConnection {
  pc: RTCPeerConnection
  audioElement: HTMLAudioElement
  userId: number
}

export class VoiceChatManager {
  private socket: Socket
  private localStream: MediaStream | null = null
  private peers: Map<number, PeerConnection> = new Map()
  private myUserId: number
  private roomId: number | null = null
  private onSpeakingChange: ((userId: number, isSpeaking: boolean) => void) | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private speakingCheckInterval: ReturnType<typeof setInterval> | null = null

  constructor(socket: Socket, myUserId: number) {
    this.socket = socket
    this.myUserId = myUserId
    this.setupSocketListeners()
  }

  private setupSocketListeners() {
    this.socket.on('voice:user-joined', ({ userId }) => {
      if (userId !== this.myUserId) {
        this.createOffer(userId)
      }
    })

    this.socket.on('voice:user-left', ({ userId }) => {
      this.removePeer(userId)
    })

    this.socket.on('voice:offer', async ({ from, offer }) => {
      await this.handleOffer(from, offer)
    })

    this.socket.on('voice:answer', async ({ from, answer }) => {
      const peer = this.peers.get(from)
      if (peer) {
        await peer.pc.setRemoteDescription(new RTCSessionDescription(answer))
      }
    })

    this.socket.on('voice:ice-candidate', async ({ from, candidate }) => {
      const peer = this.peers.get(from)
      if (peer && candidate) {
        await peer.pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })
  }

  setOnSpeakingChange(cb: (userId: number, isSpeaking: boolean) => void) {
    this.onSpeakingChange = cb
  }

  async joinVoice(roomId: number): Promise<boolean> {
    this.roomId = roomId

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })

      // Start speaking detection
      this.startSpeakingDetection()

      this.socket.emit('voice:join', { roomId })
      return true
    } catch (err) {
      console.error('Failed to get microphone:', err)
      return false
    }
  }

  leaveVoice() {
    this.socket.emit('voice:leave')
    this.cleanup()
  }

  private cleanup() {
    if (this.speakingCheckInterval) {
      clearInterval(this.speakingCheckInterval)
      this.speakingCheckInterval = null
    }

    this.localStream?.getTracks().forEach(track => track.stop())
    this.localStream = null

    this.peers.forEach((peer) => {
      peer.pc.close()
      peer.audioElement.remove()
    })
    this.peers.clear()

    this.audioContext?.close()
    this.audioContext = null
    this.analyser = null
    this.roomId = null
  }

  private startSpeakingDetection() {
    if (!this.localStream) return

    this.audioContext = new AudioContext()
    const source = this.audioContext.createMediaStreamSource(this.localStream)
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 512
    source.connect(this.analyser)

    let wasSpeaking = false
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)

    this.speakingCheckInterval = setInterval(() => {
      if (!this.analyser) return

      this.analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      const isSpeaking = average > 15

      if (isSpeaking !== wasSpeaking) {
        wasSpeaking = isSpeaking
        this.socket.emit('voice:speaking', { isSpeaking })
        this.onSpeakingChange?.(this.myUserId, isSpeaking)
      }
    }, 100)
  }

  private async createOffer(userId: number) {
    const pc = this.createPeerConnection(userId)

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!)
      })
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    this.socket.emit('voice:offer', { to: userId, offer })
  }

  private async handleOffer(from: number, offer: RTCSessionDescriptionInit) {
    const pc = this.createPeerConnection(from)

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!)
      })
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    this.socket.emit('voice:answer', { to: from, answer })
  }

  private createPeerConnection(userId: number): RTCPeerConnection {
    // Remove existing peer if any
    this.removePeer(userId)

    const pc = new RTCPeerConnection(ICE_SERVERS)
    const audioElement = document.createElement('audio')
    audioElement.autoplay = true

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('voice:ice-candidate', {
          to: userId,
          candidate: event.candidate.toJSON(),
        })
      }
    }

    pc.ontrack = (event) => {
      audioElement.srcObject = event.streams[0]
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.removePeer(userId)
      }
    }

    this.peers.set(userId, { pc, audioElement, userId })
    return pc
  }

  private removePeer(userId: number) {
    const peer = this.peers.get(userId)
    if (peer) {
      peer.pc.close()
      peer.audioElement.remove()
      this.peers.delete(userId)
    }
  }

  setMicEnabled(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach(track => {
      track.enabled = enabled
    })
  }

  // Set volume for a specific peer (proximity-based)
  setPeerVolume(userId: number, volume: number) {
    const peer = this.peers.get(userId)
    if (peer) {
      peer.audioElement.volume = Math.max(0, Math.min(1, volume))
    }
  }

  // Set volume for all peers based on distances
  updateProximityVolumes(
    myPosition: { x: number; y: number },
    playerPositions: Map<number, { x: number; y: number }>,
    maxDistance: number = 400,
    masterVolume: number = 1,
  ) {
    playerPositions.forEach((pos, userId) => {
      if (userId === this.myUserId) return
      const dx = pos.x - myPosition.x
      const dy = pos.y - myPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const volume = Math.max(0, 1 - distance / maxDistance) * masterVolume
      this.setPeerVolume(userId, volume)
    })
  }

  destroy() {
    this.cleanup()
    this.socket.off('voice:user-joined')
    this.socket.off('voice:user-left')
    this.socket.off('voice:offer')
    this.socket.off('voice:answer')
    this.socket.off('voice:ice-candidate')
  }
}
