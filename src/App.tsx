import { useState } from 'react'
import { calculateDamage, DamageInput, DamageOutput } from './utils/damageCalculator'

function App() {
  const [isPhysical, setIsPhysical] = useState(true)
  const [input, setInput] = useState<DamageInput>({
    atk: 100,
    matk: 100,
    def: 50,
    mdef: 50,
    level: 99,
    skillAtk: 100,
    cardDamage: 0,
    elementalModifier: 0,
    sizeModifier: 0,
    isPhysical: true,
  })
  const [result, setResult] = useState<DamageOutput | null>(null)

  const handleInputChange = (field: keyof DamageInput, value: number) => {
    const newInput = { ...input, [field]: value, isPhysical }
    setInput(newInput)
  }

  const handleAttackTypeChange = (physical: boolean) => {
    setIsPhysical(physical)
    setInput({ ...input, isPhysical: physical })
  }

  const handleCalculate = () => {
    const damage = calculateDamage(input)
    setResult(damage)
  }

  const handleReset = () => {
    setInput({
      atk: 100,
      matk: 100,
      def: 50,
      mdef: 50,
      level: 99,
      skillAtk: 100,
      cardDamage: 0,
      elementalModifier: 0,
      sizeModifier: 0,
      isPhysical: true,
    })
    setResult(null)
    setIsPhysical(true)
  }

  return (
    <div className="container">
      <header className="header">
        <h1>RO ダメージ計算ツール</h1>
        <p className="subtitle">ラグナロクオンライン ダメージ計算機</p>
      </header>

      <main className="main">
        <div className="calculator">
          {/* 攻撃タイプ選択 */}
          <section className="section">
            <h2>攻撃タイプ</h2>
            <div className="button-group">
              <button
                className={`btn ${isPhysical ? 'btn-active' : ''}`}
                onClick={() => handleAttackTypeChange(true)}
              >
                物理攻撃
              </button>
              <button
                className={`btn ${!isPhysical ? 'btn-active' : ''}`}
                onClick={() => handleAttackTypeChange(false)}
              >
                魔法攻撃
              </button>
            </div>
          </section>

          {/* 基本ステータス */}
          <section className="section">
            <h2>基本ステータス</h2>
            <div className="input-grid">
              {isPhysical ? (
                <div className="input-group">
                  <label htmlFor="atk">攻撃力 (ATK)</label>
                  <input
                    id="atk"
                    type="number"
                    value={input.atk}
                    onChange={(e) =>
                      handleInputChange('atk', Number(e.target.value))
                    }
                  />
                </div>
              ) : (
                <div className="input-group">
                  <label htmlFor="matk">魔法攻撃力 (MATK)</label>
                  <input
                    id="matk"
                    type="number"
                    value={input.matk}
                    onChange={(e) =>
                      handleInputChange('matk', Number(e.target.value))
                    }
                  />
                </div>
              )}

              {isPhysical ? (
                <div className="input-group">
                  <label htmlFor="def">相手の防御力 (DEF)</label>
                  <input
                    id="def"
                    type="number"
                    value={input.def}
                    onChange={(e) =>
                      handleInputChange('def', Number(e.target.value))
                    }
                  />
                </div>
              ) : (
                <div className="input-group">
                  <label htmlFor="mdef">相手の魔法防御力 (MDEF)</label>
                  <input
                    id="mdef"
                    type="number"
                    value={input.mdef}
                    onChange={(e) =>
                      handleInputChange('mdef', Number(e.target.value))
                    }
                  />
                </div>
              )}

              <div className="input-group">
                <label htmlFor="level">自分のレベル</label>
                <input
                  id="level"
                  type="number"
                  value={input.level}
                  onChange={(e) =>
                    handleInputChange('level', Number(e.target.value))
                  }
                  min="1"
                  max="255"
                />
              </div>
            </div>
          </section>

          {/* スキル及び補正値 */}
          <section className="section">
            <h2>スキル及び補正値</h2>
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="skillAtk">スキル攻撃倍率 (%)</label>
                <input
                  id="skillAtk"
                  type="number"
                  value={input.skillAtk}
                  onChange={(e) =>
                    handleInputChange('skillAtk', Number(e.target.value))
                  }
                  step="10"
                />
              </div>

              <div className="input-group">
                <label htmlFor="cardDamage">カード効果ダメージ増加 (%)</label>
                <input
                  id="cardDamage"
                  type="number"
                  value={input.cardDamage}
                  onChange={(e) =>
                    handleInputChange('cardDamage', Number(e.target.value))
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="elementalModifier">属性修正 (%)</label>
                <input
                  id="elementalModifier"
                  type="number"
                  value={input.elementalModifier}
                  onChange={(e) =>
                    handleInputChange('elementalModifier', Number(e.target.value))
                  }
                />
              </div>

              {isPhysical && (
                <div className="input-group">
                  <label htmlFor="sizeModifier">サイズ補正 (%)</label>
                  <input
                    id="sizeModifier"
                    type="number"
                    value={input.sizeModifier}
                    onChange={(e) =>
                      handleInputChange('sizeModifier', Number(e.target.value))
                    }
                  />
                </div>
              )}
            </div>
          </section>

          {/* 計算ボタン */}
          <section className="section button-section">
            <button className="btn btn-primary" onClick={handleCalculate}>
              計算する
            </button>
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
                  <span className="result-label">最小ダメージ</span>
                  <span className="result-value">{result.minDamage.toLocaleString()}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">最大ダメージ</span>
                  <span className="result-value">{result.maxDamage.toLocaleString()}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">平均ダメージ</span>
                  <span className="result-value highlight">{result.avgDamage.toLocaleString()}</span>
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
