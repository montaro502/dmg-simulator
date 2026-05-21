import { useState, useEffect } from 'react'
import { calcDefReduction, calcMdefReduction, calcMresReduction, calcResReduction, calculateAssumBonus, calculateDamage, DamageOutput } from './utils/damageCalculator'
import templatesData from './templates/attacker-templates.json'

interface AttackerStats {
  atk: number
  str: number
  matk: number
  ratio: number
  isPhysical: boolean
}

interface Template {
  id: string
  name: string
  atk: number
  str: number
  matk: number
  ratio: number
  isPhysical: boolean
}

interface DefenderStats {
  bossResistance: number
  sizeResistance: number
  raceResistance: number
  elementResistance: number
  def: number
  mdef: number
  mres: number
  res: number
  assum: boolean
  enaco: number
  ukumakura: boolean
  kongou: boolean
}

function App() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [attacker, setAttacker] = useState<AttackerStats>({
    atk: 100,
    str: 50,
    matk: 100,
    ratio: 100,
    isPhysical: true,
  })

  const [defender, setDefender] = useState<DefenderStats>({
    bossResistance: 0,
    sizeResistance: 0,
    raceResistance: 0,
    elementResistance: 0,
    def: 0,
    mdef: 0,
    mres: 0,
    res: 0,
    assum: false,
    enaco: 0,
    ukumakura: false,
    kongou: false,
  })

  const [result, setResult] = useState<DamageOutput | null>(null)

  const formatNumber = (value: number) => value.toLocaleString()
  const parseNumberInput = (value: string) => Number(value.replace(/,/g, '') || 0)

  // テンプレートを読み込む
  useEffect(() => {
    setTemplates(templatesData.templates)
  }, [])

  // パラメータが変更されたら自動計算
  useEffect(() => {
    const damage = calculateDamage({
      atk: attacker.atk,
      str: attacker.str,
      matk: attacker.matk,
      def: defender.def,
      mdef: defender.mdef,
      res: defender.res,
      mres: defender.mres,
      skillAtk: attacker.ratio,
      bossResistance: defender.bossResistance,
      sizeResistance: defender.sizeResistance,
      raceResistance: defender.raceResistance,
      elementResistance: defender.elementResistance,
      isPhysical: attacker.isPhysical,
      enaco: defender.enaco,
      assum: defender.assum,
      ukumakura: defender.ukumakura,
      kongou: defender.kongou,
    })
    setResult(damage)
  }, [attacker, defender])

  const handleAttackerChange = (field: keyof AttackerStats, value: number | boolean) => {
    setAttacker({ ...attacker, [field]: value })
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    
    if (templateId === '') {
      // 初期値にリセット
      return
    }
    
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setAttacker({
        atk: template.atk,
        str: template.str,
        matk: template.matk,
        ratio: template.ratio,
        isPhysical: template.isPhysical,
      })
    }
  }

  const handleDefenderChange = (field: keyof DefenderStats, value: number | boolean) => {
    const newDefender = { ...defender, [field]: value }
    
    // うずくまると金剛は排他的（どちらかしか選べない）
    if (field === 'ukumakura' && value === true) {
      newDefender.kongou = false
    } else if (field === 'kongou' && value === true) {
      newDefender.ukumakura = false
    }
    
    setDefender(newDefender)
  }

  const preReductionDamage = Math.floor(
    attacker.isPhysical
      ? (attacker.atk + attacker.str) * (attacker.ratio / 100)
      : attacker.matk * (attacker.ratio / 100)
  )

  const reductionPercent = result && preReductionDamage > 0
    ? (preReductionDamage - result.avgDamage) / preReductionDamage * 100
    : null
  const formattedReduction = reductionPercent !== null ? `${reductionPercent.toFixed(2)}%` : '-' 

  const calcSimpleResistance = (resistance: number): number => {
    return resistance / 100;
  }

  let assumBonusDef = 0, assumBonusMdef = 0;
  if (defender.assum) {
    assumBonusDef = calculateAssumBonus(defender.def);
    assumBonusMdef = calculateAssumBonus(defender.mdef);
  }
  const perItemReductions = {
    def: calcDefReduction(defender.def, assumBonusDef),
    mdef: calcMdefReduction(defender.mdef, assumBonusMdef),
    res: calcResReduction(defender.res),
    mres: calcMresReduction(defender.mres),
    race: calcSimpleResistance(defender.raceResistance),
    element: calcSimpleResistance(defender.elementResistance),
    boss: calcSimpleResistance(defender.bossResistance),
    size: calcSimpleResistance(defender.sizeResistance),
  }

  const handleReset = () => {
    setAttacker({
      atk: 100,
      str: 50,
      matk: 100,
      ratio: 100,
      isPhysical: true,
    })
    setSelectedTemplate('')
    setDefender({
      bossResistance: 0,
      sizeResistance: 0,
      raceResistance: 0,
      elementResistance: 0,
      def: 50,
      mdef: 50,
      mres: 50,
      res: 50,
      assum: false,
      enaco: 0,
      ukumakura: false,
      kongou: false,
    })
    setSelectedTemplate('')
    setResult(null)
  }

  return (
    <div className="container">
      <header className="header">
        <h1>RO ダメージ計算ツール</h1>
        <p className="subtitle">ラグナロクオンライン ダメージ計算機</p>
      </header>

      <main className="main">
        <div className="calculator">
          {/* テンプレート選択 */}
          <section className="section">
            <h2>攻撃キャラテンプレート</h2>
            <div className="input-group">
              <label htmlFor="template">テンプレート選択</label>
              <select
                id="template"
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="template-select"
              >
                <option value="">-- 選択してください --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* 攻撃側（敵キャラ）のステータス */}
          <section className="section">
            <h2>攻撃側（敵キャラ）のステータス</h2>
            
            {/* 攻撃タイプ選択 */}
            <div className="attack-type-selector">
              <label>攻撃タイプ</label>
              <div className="button-group">
                <button
                  className={`btn ${attacker.isPhysical ? 'btn-active' : ''}`}
                  onClick={() => handleAttackerChange('isPhysical', true)}
                >
                  物理攻撃
                </button>
                <button
                  className={`btn ${!attacker.isPhysical ? 'btn-active' : ''}`}
                  onClick={() => handleAttackerChange('isPhysical', false)}
                >
                  魔法攻撃
                </button>
              </div>
            </div>
            
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="atk">Atk</label>
                <input
                  id="atk"
                  type="text"
                  value={formatNumber(attacker.atk)}
                  onChange={(e) =>
                    handleAttackerChange('atk', parseNumberInput(e.target.value))
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="str">Str</label>
                <input
                  id="str"
                  type="text"
                  value={formatNumber(attacker.str)}
                  onChange={(e) =>
                    handleAttackerChange('str', parseNumberInput(e.target.value))
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="matk">Matk</label>
                <input
                  id="matk"
                  type="text"
                  value={formatNumber(attacker.matk)}
                  onChange={(e) =>
                    handleAttackerChange('matk', parseNumberInput(e.target.value))
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="ratio">倍率 (%)</label>
                <input
                  id="ratio"
                  type="text"
                  value={formatNumber(attacker.ratio)}
                  onChange={(e) =>
                    handleAttackerChange('ratio', parseNumberInput(e.target.value))
                  }
                />
              </div>
            </div>
          </section>

          {/* 防御側（自キャラ）のステータス */}
          <section className="section">
            <div className="pre-damage-box">
              <span className="pre-damage-label">軽減前ダメージ</span>
              <span className="pre-damage-value">{preReductionDamage.toLocaleString()}</span>
            </div>
            <h2>防御側（自キャラ）のステータス</h2>
            {/* 各項目の横に軽減率を表示（縦並びに見せるため各ブロック内に表示） */}
            <div className="input-grid defense-grid">
              <div className="stat-with-bonus">
                <div className="stat-input-group">
                  <label htmlFor="bossResistance">ボス耐性 (%)</label>
                  <input
                    id="bossResistance"
                    type="number"
                    value={defender.bossResistance}
                    onChange={(e) =>
                      handleDefenderChange('bossResistance', Number(e.target.value))
                    }
                    min="0"
                    max="95"
                  />
                  <span className="stat-reduction">{(perItemReductions.boss * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="stat-with-bonus">
                <div className="stat-input-group">
                  <label htmlFor="sizeResistance">サイズ耐性 (%)</label>
                  <input
                    id="sizeResistance"
                    type="number"
                    value={defender.sizeResistance}
                    onChange={(e) =>
                      handleDefenderChange('sizeResistance', Number(e.target.value))
                    }
                    min="0"
                    max="95"
                  />
                  <span className="stat-reduction">{(perItemReductions.size * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="stat-with-bonus">
                <div className="stat-input-group">
                  <label htmlFor="raceResistance">種族耐性 (%)</label>
                  <input
                    id="raceResistance"
                    type="number"
                    value={defender.raceResistance}
                    onChange={(e) =>
                      handleDefenderChange('raceResistance', Number(e.target.value))
                    }
                    min="0"
                    max="95"
                  />
                  <span className="stat-reduction">{(perItemReductions.race * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="stat-with-bonus">
                <div className="stat-input-group">
                  <label htmlFor="elementResistance">属性耐性 (%)</label>
                  <input
                    id="elementResistance"
                    type="number"
                    value={defender.elementResistance}
                    onChange={(e) =>
                      handleDefenderChange('elementResistance', Number(e.target.value))
                    }
                    min="0"
                    max="95"
                  />
                  <span className="stat-reduction">{(perItemReductions.element * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="stat-with-bonus">
                <div className="stat-input-group">
                  <label htmlFor="def">
                    Def {defender.assum && <span className="stat-bonus">+{defender.def}</span>}
                  </label>
                  <input
                    id="def"
                    type="number"
                    value={defender.def}
                    onChange={(e) =>
                      handleDefenderChange('def', Number(e.target.value))
                    }
                  />
                  <span className="stat-reduction">{(perItemReductions.def * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="stat-with-bonus">
                <div className="stat-input-group">
                  <label htmlFor="mdef">
                    Mdef {defender.assum && <span className="stat-bonus">+{defender.mdef}</span>}
                  </label>
                  <input
                    id="mdef"
                    type="number"
                    value={defender.mdef}
                    onChange={(e) =>
                      handleDefenderChange('mdef', Number(e.target.value))
                    }
                  />
                  <span className="stat-reduction">{(perItemReductions.mdef * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="stat-with-bonus">
                <div className="stat-input-group">
                  <label htmlFor="res">Res</label>
                  <input
                    id="res"
                    type="number"
                    value={defender.res}
                    onChange={(e) =>
                      handleDefenderChange('res', Number(e.target.value))
                    }
                  />
                  <span className="stat-reduction">{(perItemReductions.res * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="stat-with-bonus">
                <div className="stat-input-group">
                  <label htmlFor="mres">Mres</label>
                  <input
                    id="mres"
                    type="number"
                    value={defender.mres}
                    onChange={(e) =>
                      handleDefenderChange('mres', Number(e.target.value))
                    }
                  />
                  <span className="stat-reduction">{(perItemReductions.mres * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* チェックボックスセクション */}
            <div className="checkbox-grid">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={defender.assum}
                  onChange={(e) =>
                    handleDefenderChange('assum', e.target.checked)
                  }
                />
                <span>アスム</span>
              </label>

              <label className="input-group">
                <span>エナコ</span>
                <select
                  value={defender.enaco}
                  onChange={(e) =>
                    handleDefenderChange('enaco', Number(e.target.value))
                  }
                  className="enaco-select"
                >
                  <option value="0">なし</option>
                  <option value="6">6%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="24">24%</option>
                  <option value="30">30%</option>
                </select>
              </label>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={defender.ukumakura}
                  onChange={(e) =>
                    handleDefenderChange('ukumakura', e.target.checked)
                  }
                />
                <span>うずくまる</span>
              </label>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={defender.kongou}
                  onChange={(e) =>
                    handleDefenderChange('kongou', e.target.checked)
                  }
                />
                <span>金剛</span>
              </label>
            </div>
          </section>

          {/* 計算ボタン */}
          <section className="section button-section">
            <button className="btn btn-secondary" onClick={handleReset}>
              リセット
            </button>
          </section>

          {/* 結果表示 */}
          {result && (
            <section className="section result-section">
              <h2>ダメージ計算結果</h2>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">被ダメージ</span>
                  <span className="result-value highlight">{Math.ceil(result.avgDamage).toLocaleString()}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">総軽減率</span>
                  <span className="result-value">{formattedReduction}</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>
          このツールは概算値です。実際のゲーム内ダメージと異なる場合があります。
        </p>
        <p className="footer-version">v0.1.0</p>
      </footer>
    </div>
  )
}

export default App
