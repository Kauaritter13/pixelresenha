'use client'

import { useState } from 'react'
import { type CharacterCustomization } from '@/lib/game-context'
import { CharacterPreviewPanel } from './pixel-avatar'

interface CharacterEditorProps {
  initialCharacter?: CharacterCustomization
  onSave: (character: CharacterCustomization) => void
  showNameField?: boolean
}

const skinTones = [
  { id: 'light', color: '#FFDBB4', label: 'Claro' },
  { id: 'fair', color: '#F5D0C5', label: 'Rosado' },
  { id: 'medium', color: '#D4A574', label: 'Médio' },
  { id: 'olive', color: '#C68642', label: 'Oliva' },
  { id: 'tan', color: '#8D5524', label: 'Bronzeado' },
  { id: 'dark', color: '#5C3317', label: 'Escuro' },
]

const hairStyles = [
  { id: 'short', label: 'Curto' },
  { id: 'long', label: 'Longo' },
  { id: 'spiky', label: 'Espetado' },
  { id: 'mohawk', label: 'Moicano' },
  { id: 'curly', label: 'Cacheado' },
  { id: 'bald', label: 'Careca' },
]

const hairColors = [
  { id: 'black', color: '#1A1A1A', label: 'Preto' },
  { id: 'brown', color: '#4A3728', label: 'Castanho' },
  { id: 'blonde', color: '#D4A84B', label: 'Loiro' },
  { id: 'red', color: '#8B2500', label: 'Ruivo' },
  { id: 'orange', color: '#FF6B35', label: 'Laranja' },
  { id: 'purple', color: '#9C27B0', label: 'Roxo' },
  { id: 'blue', color: '#2196F3', label: 'Azul' },
  { id: 'pink', color: '#E91E63', label: 'Rosa' },
  { id: 'green', color: '#4CAF50', label: 'Verde' },
  { id: 'white', color: '#E8E8E8', label: 'Branco' },
]

const shirtStyles = [
  { id: 'tshirt', label: 'Camiseta' },
  { id: 'polo', label: 'Polo' },
  { id: 'hoodie', label: 'Moletom' },
]

const pantsStyles = [
  { id: 'jeans', label: 'Jeans' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'formal', label: 'Social' },
]

const clothingColors = [
  { id: 'red', color: '#E53935', label: 'Vermelho' },
  { id: 'pink', color: '#E91E63', label: 'Rosa' },
  { id: 'purple', color: '#9C27B0', label: 'Roxo' },
  { id: 'blue', color: '#2196F3', label: 'Azul' },
  { id: 'cyan', color: '#00BCD4', label: 'Ciano' },
  { id: 'green', color: '#4CAF50', label: 'Verde' },
  { id: 'yellow', color: '#FFEB3B', label: 'Amarelo' },
  { id: 'orange', color: '#FF9800', label: 'Laranja' },
  { id: 'brown', color: '#795548', label: 'Marrom' },
  { id: 'navy', color: '#1E3A5F', label: 'Marinho' },
  { id: 'black', color: '#212121', label: 'Preto' },
  { id: 'white', color: '#F5F5F5', label: 'Branco' },
]

const hatStyles = [
  { id: null, label: 'Nenhum' },
  { id: 'cap', label: 'Boné' },
  { id: 'crown', label: 'Coroa' },
  { id: 'beanie', label: 'Gorro' },
  { id: 'tophat', label: 'Cartola' },
]

const accessories = [
  { id: null, label: 'Nenhum' },
  { id: 'glasses', label: 'Óculos' },
  { id: 'sunglasses', label: 'Óculos de Sol' },
  { id: 'earring', label: 'Brinco' },
  { id: 'mask', label: 'Máscara' },
]

const genders = [
  { id: 'male', label: 'Masculino' },
  { id: 'female', label: 'Feminino' },
  { id: 'other', label: 'Outro' },
]

const defaultCharacter: CharacterCustomization = {
  name: '',
  gender: 'other',
  skinTone: '#F5D0C5',
  hairStyle: 'short',
  hairColor: '#4A3728',
  shirtStyle: 'tshirt',
  shirtColor: '#4CAF50',
  pantsStyle: 'jeans',
  pantsColor: '#1E3A5F',
  hatStyle: null,
  accessory: null,
}

export function CharacterEditor({ initialCharacter, onSave, showNameField = true }: CharacterEditorProps) {
  const [character, setCharacter] = useState<CharacterCustomization>(
    initialCharacter || defaultCharacter
  )
  const [activeTab, setActiveTab] = useState<'body' | 'clothes' | 'accessories'>('body')

  const updateCharacter = (updates: Partial<CharacterCustomization>) => {
    setCharacter(prev => ({ ...prev, ...updates }))
  }

  const tabs = [
    { id: 'body', label: 'Corpo' },
    { id: 'clothes', label: 'Roupas' },
    { id: 'accessories', label: 'Acessórios' },
  ] as const

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Preview */}
      <CharacterPreviewPanel character={character} className="lg:sticky lg:top-4 h-fit" />

      {/* Editor */}
      <div className="flex-1 pixel-panel p-6">
        {showNameField && (
          <div className="mb-6">
            <label className="block text-sm text-muted-foreground mb-2">Nome do Personagem</label>
            <input
              type="text"
              value={character.name}
              onChange={(e) => updateCharacter({ name: e.target.value })}
              placeholder="Digite o nome..."
              className="pixel-input w-full"
              maxLength={20}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-mono text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              style={{
                boxShadow: activeTab === tab.id
                  ? '2px 2px 0 0 oklch(0.5 0.12 145)'
                  : '2px 2px 0 0 oklch(0.2 0.02 260)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Corpo */}
        {activeTab === 'body' && (
          <div className="space-y-6">
            {/* Gênero */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Gênero</label>
              <div className="flex gap-2 flex-wrap">
                {genders.map(g => (
                  <button
                    key={g.id}
                    onClick={() => updateCharacter({ gender: g.id as CharacterCustomization['gender'] })}
                    className={`px-4 py-2 text-sm transition-all ${
                      character.gender === g.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    style={{
                      boxShadow: character.gender === g.id
                        ? '2px 2px 0 0 oklch(0.5 0.12 145)'
                        : '2px 2px 0 0 oklch(0.2 0.02 260)',
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tom de Pele */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Tom de Pele</label>
              <div className="flex gap-2 flex-wrap">
                {skinTones.map(tone => (
                  <button
                    key={tone.id}
                    onClick={() => updateCharacter({ skinTone: tone.color })}
                    className={`w-10 h-10 rounded transition-all ${
                      character.skinTone === tone.color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    }`}
                    style={{ backgroundColor: tone.color }}
                    title={tone.label}
                  />
                ))}
              </div>
            </div>

            {/* Estilo de Cabelo */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Estilo de Cabelo</label>
              <div className="flex gap-2 flex-wrap">
                {hairStyles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => updateCharacter({ hairStyle: style.id })}
                    className={`px-4 py-2 text-sm transition-all ${
                      character.hairStyle === style.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    style={{
                      boxShadow: character.hairStyle === style.id
                        ? '2px 2px 0 0 oklch(0.5 0.12 145)'
                        : '2px 2px 0 0 oklch(0.2 0.02 260)',
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor do Cabelo */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Cor do Cabelo</label>
              <div className="flex gap-2 flex-wrap">
                {hairColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => updateCharacter({ hairColor: color.color })}
                    className={`w-8 h-8 rounded transition-all ${
                      character.hairColor === color.color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Roupas */}
        {activeTab === 'clothes' && (
          <div className="space-y-6">
            {/* Estilo de Camiseta */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Tipo de Roupa Superior</label>
              <div className="flex gap-2 flex-wrap">
                {shirtStyles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => updateCharacter({ shirtStyle: style.id })}
                    className={`px-4 py-2 text-sm transition-all ${
                      character.shirtStyle === style.id
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    style={{
                      boxShadow: character.shirtStyle === style.id
                        ? '2px 2px 0 0 oklch(0.45 0.14 30)'
                        : '2px 2px 0 0 oklch(0.2 0.02 260)',
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor da Camiseta */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Cor da Roupa Superior</label>
              <div className="flex gap-2 flex-wrap">
                {clothingColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => updateCharacter({ shirtColor: color.color })}
                    className={`w-8 h-8 rounded transition-all ${
                      character.shirtColor === color.color ? 'ring-2 ring-secondary ring-offset-2 ring-offset-background' : ''
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Estilo de Calça */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Tipo de Roupa Inferior</label>
              <div className="flex gap-2 flex-wrap">
                {pantsStyles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => updateCharacter({ pantsStyle: style.id })}
                    className={`px-4 py-2 text-sm transition-all ${
                      character.pantsStyle === style.id
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    style={{
                      boxShadow: character.pantsStyle === style.id
                        ? '2px 2px 0 0 oklch(0.45 0.14 30)'
                        : '2px 2px 0 0 oklch(0.2 0.02 260)',
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor da Calça */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Cor da Roupa Inferior</label>
              <div className="flex gap-2 flex-wrap">
                {clothingColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => updateCharacter({ pantsColor: color.color })}
                    className={`w-8 h-8 rounded transition-all ${
                      character.pantsColor === color.color ? 'ring-2 ring-secondary ring-offset-2 ring-offset-background' : ''
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Acessórios */}
        {activeTab === 'accessories' && (
          <div className="space-y-6">
            {/* Chapéu */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Chapéu</label>
              <div className="flex gap-2 flex-wrap">
                {hatStyles.map(hat => (
                  <button
                    key={hat.id || 'none'}
                    onClick={() => updateCharacter({ hatStyle: hat.id })}
                    className={`px-4 py-2 text-sm transition-all ${
                      character.hatStyle === hat.id
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    style={{
                      boxShadow: character.hatStyle === hat.id
                        ? '2px 2px 0 0 oklch(0.55 0.1 60)'
                        : '2px 2px 0 0 oklch(0.2 0.02 260)',
                    }}
                  >
                    {hat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Acessórios */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Acessórios</label>
              <div className="flex gap-2 flex-wrap">
                {accessories.map(acc => (
                  <button
                    key={acc.id || 'none'}
                    onClick={() => updateCharacter({ accessory: acc.id })}
                    className={`px-4 py-2 text-sm transition-all ${
                      character.accessory === acc.id
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    style={{
                      boxShadow: character.accessory === acc.id
                        ? '2px 2px 0 0 oklch(0.55 0.1 60)'
                        : '2px 2px 0 0 oklch(0.2 0.02 260)',
                    }}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Botão de Salvar */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => onSave(character)}
            className="pixel-button bg-primary text-primary-foreground"
          >
            Salvar Personagem
          </button>
        </div>
      </div>
    </div>
  )
}
