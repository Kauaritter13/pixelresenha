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
  { color: '#FFDBB4', label: 'Claro' },
  { color: '#F5D0C5', label: 'Rosado' },
  { color: '#E8B88A', label: 'Pêssego' },
  { color: '#D4A574', label: 'Médio' },
  { color: '#C68642', label: 'Oliva' },
  { color: '#A0724A', label: 'Canela' },
  { color: '#8D5524', label: 'Bronzeado' },
  { color: '#6B3A1F', label: 'Mogno' },
  { color: '#5C3317', label: 'Escuro' },
  { color: '#3B1F0B', label: 'Ébano' },
]

const hairStyleGroups = [
  { label: 'Curtos', styles: [
    { id: 'short', label: 'Curto' },
    { id: 'buzz', label: 'Raspado' },
    { id: 'spiky', label: 'Espetado' },
    { id: 'messy', label: 'Bagunçado' },
    { id: 'slicked', label: 'Penteado' },
    { id: 'mohawk', label: 'Moicano' },
    { id: 'bald', label: 'Careca' },
  ]},
  { label: 'Médios', styles: [
    { id: 'curly', label: 'Cacheado' },
    { id: 'emo', label: 'Emo' },
    { id: 'topknot', label: 'Coque' },
  ]},
  { label: 'Longos', styles: [
    { id: 'long', label: 'Longo' },
    { id: 'ponytail', label: 'Rabo de Cavalo' },
    { id: 'pigtails', label: 'Maria Chiquinha' },
    { id: 'twintail', label: 'Twintail' },
    { id: 'afro', label: 'Afro' },
    { id: 'flowing', label: 'Solto' },
  ]},
]

const hairColors = [
  { color: '#1A1A1A', label: 'Preto' },
  { color: '#4A3728', label: 'Castanho' },
  { color: '#6B4423', label: 'Chocolate' },
  { color: '#D4A84B', label: 'Loiro' },
  { color: '#F5D68A', label: 'Loiro Claro' },
  { color: '#8B2500', label: 'Ruivo' },
  { color: '#FF6B35', label: 'Laranja' },
  { color: '#9C27B0', label: 'Roxo' },
  { color: '#7B1FA2', label: 'Violeta' },
  { color: '#2196F3', label: 'Azul' },
  { color: '#00BCD4', label: 'Ciano' },
  { color: '#E91E63', label: 'Rosa' },
  { color: '#FF4081', label: 'Pink' },
  { color: '#4CAF50', label: 'Verde' },
  { color: '#E8E8E8', label: 'Branco' },
  { color: '#9E9E9E', label: 'Cinza' },
]

const eyeColors = [
  { color: '#1A1A1A', label: 'Preto' },
  { color: '#4A3728', label: 'Castanho' },
  { color: '#2196F3', label: 'Azul' },
  { color: '#4CAF50', label: 'Verde' },
  { color: '#9E9E9E', label: 'Cinza' },
  { color: '#FF9800', label: 'Âmbar' },
  { color: '#9C27B0', label: 'Roxo' },
  { color: '#E53935', label: 'Vermelho' },
]

const shirtStyles = [
  { id: 'tshirt', label: 'Camiseta' },
  { id: 'polo', label: 'Polo' },
  { id: 'hoodie', label: 'Moletom' },
  { id: 'tanktop', label: 'Regata' },
  { id: 'jacket', label: 'Jaqueta' },
  { id: 'vest', label: 'Colete' },
  { id: 'robe', label: 'Manto' },
]

const pantsStyles = [
  { id: 'jeans', label: 'Jeans' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'bermuda', label: 'Bermuda' },
  { id: 'formal', label: 'Social' },
  { id: 'skirt', label: 'Saia' },
  { id: 'sweatpants', label: 'Moletom' },
]

const shoeStyles = [
  { id: 'sneakers', label: 'Tênis' },
  { id: 'boots', label: 'Botas' },
  { id: 'sandals', label: 'Sandálias' },
  { id: 'fancy', label: 'Social' },
]

const clothingColors = [
  { color: '#E53935', label: 'Vermelho' },
  { color: '#E91E63', label: 'Rosa' },
  { color: '#FF4081', label: 'Pink' },
  { color: '#9C27B0', label: 'Roxo' },
  { color: '#673AB7', label: 'Violeta' },
  { color: '#3F51B5', label: 'Índigo' },
  { color: '#2196F3', label: 'Azul' },
  { color: '#00BCD4', label: 'Ciano' },
  { color: '#009688', label: 'Teal' },
  { color: '#4CAF50', label: 'Verde' },
  { color: '#8BC34A', label: 'Lima' },
  { color: '#FFEB3B', label: 'Amarelo' },
  { color: '#FF9800', label: 'Laranja' },
  { color: '#FF5722', label: 'Coral' },
  { color: '#795548', label: 'Marrom' },
  { color: '#1E3A5F', label: 'Marinho' },
  { color: '#212121', label: 'Preto' },
  { color: '#757575', label: 'Cinza' },
  { color: '#F5F5F5', label: 'Branco' },
  { color: '#FFCDD2', label: 'Rosa Claro' },
]

const hatStyles = [
  { id: null, label: 'Nenhum' },
  { id: 'cap', label: 'Boné' },
  { id: 'crown', label: 'Coroa' },
  { id: 'beanie', label: 'Gorro' },
  { id: 'tophat', label: 'Cartola' },
  { id: 'wizard', label: 'Mago' },
  { id: 'pirate', label: 'Pirata' },
  { id: 'bunny', label: 'Orelhas' },
  { id: 'horns', label: 'Chifres' },
  { id: 'headband', label: 'Faixa' },
  { id: 'halo', label: 'Auréola' },
]

const accessories = [
  { id: null, label: 'Nenhum' },
  { id: 'glasses', label: 'Óculos' },
  { id: 'sunglasses', label: 'Óculos de Sol' },
  { id: 'monocle', label: 'Monóculo' },
  { id: 'eyepatch', label: 'Tapa-Olho' },
  { id: 'earring', label: 'Brinco' },
  { id: 'mask', label: 'Máscara' },
  { id: 'scarf', label: 'Cachecol' },
  { id: 'cape', label: 'Capa' },
  { id: 'beard', label: 'Barba' },
  { id: 'bandana', label: 'Bandana' },
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
  eyeColor: '#1A1A1A',
  shirtStyle: 'tshirt',
  shirtColor: '#4CAF50',
  pantsStyle: 'jeans',
  pantsColor: '#1E3A5F',
  shoeStyle: 'sneakers',
  hatStyle: null,
  accessory: null,
}

function ColorPicker({ colors, value, onChange, ringColor = 'ring-primary' }: {
  colors: { color: string; label: string }[]
  value: string
  onChange: (color: string) => void
  ringColor?: string
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {colors.map(c => (
        <button
          key={c.color}
          onClick={() => onChange(c.color)}
          className={`w-7 h-7 rounded transition-all hover:scale-110 ${
            value === c.color ? `ring-2 ${ringColor} ring-offset-2 ring-offset-background scale-110` : ''
          }`}
          style={{ backgroundColor: c.color }}
          title={c.label}
        />
      ))}
    </div>
  )
}

function StyleButton({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs transition-all ${
        selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
      style={{
        boxShadow: selected ? '2px 2px 0 0 oklch(0.5 0.12 145)' : '2px 2px 0 0 oklch(0.2 0.02 260)',
      }}
    >
      {label}
    </button>
  )
}

export function CharacterEditor({ initialCharacter, onSave, showNameField = true }: CharacterEditorProps) {
  const [character, setCharacter] = useState<CharacterCustomization>(initialCharacter || defaultCharacter)
  const [activeTab, setActiveTab] = useState<'body' | 'clothes' | 'accessories'>('body')

  const update = (u: Partial<CharacterCustomization>) => setCharacter(prev => ({ ...prev, ...u }))

  const tabs = [
    { id: 'body' as const, label: 'Corpo' },
    { id: 'clothes' as const, label: 'Roupas' },
    { id: 'accessories' as const, label: 'Acessórios' },
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <CharacterPreviewPanel character={character} className="lg:sticky lg:top-4 h-fit" />

      <div className="flex-1 pixel-panel p-6">
        {showNameField && (
          <div className="mb-6">
            <label className="block text-sm text-muted-foreground mb-2">Nome do Personagem</label>
            <input
              type="text"
              value={character.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Digite o nome..."
              className="pixel-input w-full"
              maxLength={20}
            />
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-mono text-sm transition-all ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              style={{
                boxShadow: activeTab === tab.id ? '2px 2px 0 0 oklch(0.5 0.12 145)' : '2px 2px 0 0 oklch(0.2 0.02 260)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'body' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Gênero</label>
              <div className="flex gap-2 flex-wrap">
                {genders.map(g => (
                  <StyleButton key={g.id} selected={character.gender === g.id} label={g.label} onClick={() => update({ gender: g.id as CharacterCustomization['gender'] })} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Tom de Pele</label>
              <ColorPicker colors={skinTones} value={character.skinTone} onChange={(c) => update({ skinTone: c })} />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Cor dos Olhos</label>
              <ColorPicker colors={eyeColors} value={character.eyeColor || '#1A1A1A'} onChange={(c) => update({ eyeColor: c })} />
            </div>

            {hairStyleGroups.map(group => (
              <div key={group.label}>
                <label className="block text-sm text-muted-foreground mb-2">Cabelo - {group.label}</label>
                <div className="flex gap-1.5 flex-wrap">
                  {group.styles.map(style => (
                    <StyleButton key={style.id} selected={character.hairStyle === style.id} label={style.label} onClick={() => update({ hairStyle: style.id })} />
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Cor do Cabelo</label>
              <ColorPicker colors={hairColors} value={character.hairColor} onChange={(c) => update({ hairColor: c })} />
            </div>
          </div>
        )}

        {activeTab === 'clothes' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Roupa Superior</label>
              <div className="flex gap-1.5 flex-wrap">
                {shirtStyles.map(s => (
                  <StyleButton key={s.id} selected={character.shirtStyle === s.id} label={s.label} onClick={() => update({ shirtStyle: s.id })} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Cor da Roupa Superior</label>
              <ColorPicker colors={clothingColors} value={character.shirtColor} onChange={(c) => update({ shirtColor: c })} ringColor="ring-secondary" />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Roupa Inferior</label>
              <div className="flex gap-1.5 flex-wrap">
                {pantsStyles.map(s => (
                  <StyleButton key={s.id} selected={character.pantsStyle === s.id} label={s.label} onClick={() => update({ pantsStyle: s.id })} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Cor da Roupa Inferior</label>
              <ColorPicker colors={clothingColors} value={character.pantsColor} onChange={(c) => update({ pantsColor: c })} ringColor="ring-secondary" />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Calçado</label>
              <div className="flex gap-1.5 flex-wrap">
                {shoeStyles.map(s => (
                  <StyleButton key={s.id} selected={(character.shoeStyle || 'sneakers') === s.id} label={s.label} onClick={() => update({ shoeStyle: s.id })} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accessories' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Chapéu / Cabeça</label>
              <div className="flex gap-1.5 flex-wrap">
                {hatStyles.map(h => (
                  <StyleButton key={h.id || 'none'} selected={character.hatStyle === h.id} label={h.label} onClick={() => update({ hatStyle: h.id })} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Acessórios</label>
              <div className="flex gap-1.5 flex-wrap">
                {accessories.map(a => (
                  <StyleButton key={a.id || 'none'} selected={character.accessory === a.id} label={a.label} onClick={() => update({ accessory: a.id })} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button onClick={() => onSave(character)} className="pixel-button bg-primary text-primary-foreground">
            Salvar Personagem
          </button>
        </div>
      </div>
    </div>
  )
}
