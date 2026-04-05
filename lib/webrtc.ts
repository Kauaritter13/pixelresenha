'use client'

import type { Socket } from 'socket.io-client'

// Free TURN servers for NAT traversal (essential for real-world connections)
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Free TURN servers from metered.ca
    {
      urls: 'turn:a.relay.metered.ca:80',
      username: 'e8dd65b092d0bb6f3c3bf079',
      credential: 'kMn/sKDMcZvaLhpO',
    },
    {
      urls: 'turn:a.relay.metered.ca:80?transport=tcp',
      username: 'e8dd65b092d0bb6f3c3bf079',
      credential: 'kMn/sKDMcZvaLhpO',
    },
    {
      urls: 'turn:a.relay.metered.ca:443',
      username: 'e8dd65b092d0bb6f3c3bf079',
      credential: 'kMn/sKDMcZvaLhpO',
    },
    {
      urls: 'turn:a.relay.metered.ca:443?transport=tcp',
      username: 'e8dd65b092d0bb6f3c3bf079',
      credential: 'kMn/sKDMcZvaLhpO',
    },
  ],
  iceCandidatePoolSize: 10,
}

interface PeerConnection {
  pc: RTCPeerConnection
  audioElement: HTMLAudioElement
  userId: number
}

// Container for audio elements (appended to DOM)
let audioContainer: HTMLDivElement | null = null

function getAudioContainer(): HTMLDivElement {
  if (!audioContainer) {
    audioContainer = document.createElement('div')
    audioContainer.id = 'voice-chat-audio'
    audioContainer.style.display = 'none'
    document.body.appendChild(audioContainer)
  }
  return audioContainer
}

export class VoiceChatManager {
  private socket: Socket
  private localStream: MediaStream | null = null
  private peers: Map<number, PeerConnection> = new Map()
  private myUserId: number
  private roomId: number | null = null
  private onSpeakingChange: ((userId: number, isSpeaking: boolean) => void) | null = null
  private onError: ((error: string) => void) | null = null
  private onPeerConnected: ((userId: number) => void) | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private speakingCheckInterval: ReturnType<typeof setInterval> | null = null

  constructor(socket: Socket, myUserId: number) {
    this.socket = socket
    this.myUserId = myUserId
    this.setupSocketListeners()
  }

  private log(msg: string, ...args: unknown[]) {
    console.log(`[Voice] ${msg}`, ...args)
  }

  private setupSocketListeners() {
    this.socket.on('voice:user-joined', ({ userId }) => {
      if (userId !== this.myUserId) {
        this.log(`User ${userId} joined voice, creating offer`)
        this.createOffer(userId)
      }
    })

    this.socket.on('voice:user-left', ({ userId }) => {
      this.log(`User ${userId} left voice`)
      this.removePeer(userId)
    })

    this.socket.on('voice:offer', async ({ from, offer }) => {
      this.log(`Received offer from ${from}`)
      try {
        await this.handleOffer(from, offer)
      } catch (err) {
        this.log('Error handling offer:', err)
      }
    })

    this.socket.on('voice:answer', async ({ from, answer }) => {
      this.log(`Received answer from ${from}`)
      const peer = this.peers.get(from)
      if (peer) {
        try {
          await peer.pc.setRemoteDescription(new RTCSessionDescription(answer))
          this.log(`Set remote description for ${from}`)
        } catch (err) {
          this.log('Error setting remote description:', err)
        }
      }
    })

    this.socket.on('voice:ice-candidate', async ({ from, candidate }) => {
      const peer = this.peers.get(from)
      if (peer && candidate) {
        try {
          await peer.pc.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (err) {
          // ICE candidates can arrive before remote description is set, ignore gracefully
        }
      }
    })
  }

  setOnSpeakingChange(cb: (userId: number, isSpeaking: boolean) => void) {
    this.onSpeakingChange = cb
  }

  setOnError(cb: (error: string) => void) {
    this.onError = cb
  }

  setOnPeerConnected(cb: (userId: number) => void) {
    this.onPeerConnected = cb
  }

  async joinVoice(roomId: number): Promise<boolean> {
    this.roomId = roomId

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
        video: false,
      })

      this.log('Got local stream, tracks:', this.localStream.getAudioTracks().length)

      // Start speaking detection
      this.startSpeakingDetection()

      // Tell server we joined voice
      this.socket.emit('voice:join', { roomId })
      this.log('Joined voice room', roomId)
      return true
    } catch (err) {
      this.log('Failed to get microphone:', err)
      this.onError?.('Não foi possível acessar o microfone. Verifique as permissões.')
      return false
    }
  }

  leaveVoice() {
    this.log('Leaving voice')
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
      peer.audioElement.pause()
      peer.audioElement.srcObject = null
      peer.audioElement.remove()
    })
    this.peers.clear()

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {})
    }
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
    this.analyser.smoothingTimeConstant = 0.3
    source.connect(this.analyser)

    let wasSpeaking = false
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)

    this.speakingCheckInterval = setInterval(() => {
      if (!this.analyser) return

      this.analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      const isSpeaking = average > 12

      if (isSpeaking !== wasSpeaking) {
        wasSpeaking = isSpeaking
        this.socket.emit('voice:speaking', { isSpeaking })
        this.onSpeakingChange?.(this.myUserId, isSpeaking)
      }
    }, 100)
  }

  private async createOffer(userId: number) {
    try {
      const pc = this.createPeerConnection(userId)

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.localStream!)
        })
        this.log(`Added ${this.localStream.getTracks().length} tracks to offer for ${userId}`)
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
      })
      await pc.setLocalDescription(offer)

      this.socket.emit('voice:offer', { to: userId, offer: pc.localDescription })
      this.log(`Sent offer to ${userId}`)
    } catch (err) {
      this.log('Error creating offer:', err)
      this.onError?.('Erro ao conectar com outro jogador')
    }
  }

  private async handleOffer(from: number, offer: RTCSessionDescriptionInit) {
    const pc = this.createPeerConnection(from)

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!)
      })
      this.log(`Added ${this.localStream.getTracks().length} tracks to answer for ${from}`)
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    this.socket.emit('voice:answer', { to: from, answer: pc.localDescription })
    this.log(`Sent answer to ${from}`)
  }

  private createPeerConnection(userId: number): RTCPeerConnection {
    this.removePeer(userId)

    const pc = new RTCPeerConnection(ICE_SERVERS)

    // Create audio element IN the DOM
    const container = getAudioContainer()
    const audioElement = document.createElement('audio')
    audioElement.autoplay = true
    audioElement.playsInline = true
    audioElement.setAttribute('data-userid', String(userId))
    container.appendChild(audioElement)

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('voice:ice-candidate', {
          to: userId,
          candidate: event.candidate.toJSON(),
        })
      }
    }

    pc.ontrack = (event) => {
      this.log(`Received audio track from ${userId}`, event.streams.length, 'streams')
      if (event.streams[0]) {
        audioElement.srcObject = event.streams[0]

        // Force play (handle autoplay policy)
        const playPromise = audioElement.play()
        if (playPromise) {
          playPromise.catch((err) => {
            this.log(`Autoplay blocked for ${userId}, will retry on user interaction:`, err)
            // Add a one-time click handler to retry
            const retryPlay = () => {
              audioElement.play().catch(() => {})
              document.removeEventListener('click', retryPlay)
            }
            document.addEventListener('click', retryPlay, { once: true })
          })
        }
      }
    }

    pc.onconnectionstatechange = () => {
      this.log(`Peer ${userId} connection state: ${pc.connectionState}`)
      if (pc.connectionState === 'connected') {
        this.onPeerConnected?.(userId)
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.log(`Peer ${userId} disconnected/failed, removing`)
        this.removePeer(userId)
      }
    }

    pc.oniceconnectionstatechange = () => {
      this.log(`Peer ${userId} ICE state: ${pc.iceConnectionState}`)
    }

    this.peers.set(userId, { pc, audioElement, userId })
    return pc
  }

  private removePeer(userId: number) {
    const peer = this.peers.get(userId)
    if (peer) {
      peer.pc.close()
      peer.audioElement.pause()
      peer.audioElement.srcObject = null
      peer.audioElement.remove()
      this.peers.delete(userId)
    }
  }

  setMicEnabled(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach(track => {
      track.enabled = enabled
    })
    this.log('Mic', enabled ? 'enabled' : 'disabled')
  }

  setPeerVolume(userId: number, volume: number) {
    const peer = this.peers.get(userId)
    if (peer) {
      peer.audioElement.volume = Math.max(0, Math.min(1, volume))
    }
  }

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

  getPeerCount(): number {
    return this.peers.size
  }

  getConnectedPeers(): number[] {
    const connected: number[] = []
    this.peers.forEach((peer, userId) => {
      if (peer.pc.connectionState === 'connected') {
        connected.push(userId)
      }
    })
    return connected
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
