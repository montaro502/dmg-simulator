import { useState } from 'react'
import { calculateDamage, DamageInput, DamageOutput } from './utils/damageCalculator'

interface AttackerStats {
  atk: number
  str: number
  ratio: number
}

interface DefenderStats {
  bossResistance: number
  sizeResistance: number
  raceResistance: number
  elementResistance: number
  mdef: number
  mres: number
  assum: boolean
  enaco: boolean
  ukumakura: boolean
  kongou: boolean
}

function App() {
  const [attacker, setAttacker] = useState<AttackerStats>({
    atk: 100,
    str: 50,
    ratio: 100,
  })

  const [defender, setDefender] = useState<DefenderStats>({
    bossResistance: 0,
    sizeResistance: 0,
    raceResistance: 0,
    elementResistance: 0,
    mdef: 50,
    mres: 50,
    assum: false,
    enaco: false,
    ukumakura: false,
    kongou: false,
  })

  const [result, setResult] = useState<DamageOutput | null>(null)

  const handleAttackerChange = (field: keyof AttackerStats, value: number | boolean) => {
    setAttacker({ ...attacker, [field]: value })
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

  const handleCalculate = () => {
    // ダメージ計算のロジックは後で実装
    const damage = calculateDamage({
      atk: attacker.atk,
      matk: 100,
      def: 50,
      mdef: defender.mdef,
      level: 99,
      skillAtk: attacker.ratio,
      cardDamage: 0,
      elementalModifier: 0,
      sizeModifier: 0,
      isPhysical: true,
    })
    setResult(damage)
  }

  const handleReset = () => {
    setAttacker({
      atk: 100,
      str: 50,
      ratio: 100,
    })
    setDefender({
      bossResistance: 0,
      sizeResistance: 0,
      raceResistance: 0,
      elementResistance: 0,
      mdef: 50,
      mres: 50,
      assum: false,
      enaco: false,
      ukumakura: false,
      kongou: false,
    })
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
          {/* 攻撃側（敵キャラ）のステータス */}
          <section className="section">
            <h2>攻撃側（敵キャラ）のステータス</h2>
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="atk">Atk</label>
                <input
                  id="atk"
                  type="number"
                  value={attacker.atk}
                  onChange={(e) =>
                    handleAttackerChange('atk', Number(e.target.value))
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="str">Str</label>
                <input
                  id="str"
                  type="number"
                  value={attacker.str}
                  onChange={(e) =>
                    handleAttackerChange('str', Number(e.target.value))
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="ratio">倍率 (%)</label>
                <input
                  id="ratio"
                  type="number"
                  value={attacker.ratio}
                  onChange={(e) =>
                    handleAttackerChange('ratio', Number(e.target.value))
                  }
                  step="10"
                />
              </div>
            </div>
          </section>

          {/* 防御側（自キャラ）のステータス */}
          <section className="section">
            <h2>防御側（自キャラ）のステータス</h2>
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="bossResistance">ボス耐性</label>
                <input
                  id="bossResistance"
                  type="number"
                  value={defender.bossResistance}
                  onChange={(e) =>
                    handleDefenderChange('bossResistance', Number(e.target.value))
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="sizeResistance">サイズ耐性</label>
                <input
                  id="sizeResistance"
                  type="number"
                  value={defender.sizeResistance}
                  onChange={(e) =>
                    handleDefenderChange('sizeResistance', Number(e.target.value))
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="raceResistance">種族耐性</label>
                <input
                  id="raceResistance"
                  type="number"
                  value={defender.raceResistance}
                  onChange={(e) =>
                    handleDefenderChange('raceResistance', Number(e.target.value))
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="elementResistance">属性耐性</label>
                <input
                  id="elementResistance"
                  type="number"
                  value={defender.elementResistance}
                  onChange={(e) =>
                    handleDefenderChange('elementResistance', Number(e.target.value))
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="mdef">Mdef</label>
                <input
                  id="mdef"
                  type="number"
                  value={defender.mdef}
                  onChange={(e) =>
                    handleDefenderChange('mdef', Number(e.target.value))
                  }
                />
              </div>

              <div className="input-group">
                <label htmlFor="mres">Mres</label>
                <input
                  id="mres"
                  type="number"
                  value={defender.mres}
                  onChange={(e) =>
                    handleDefenderChange('mres', Number(e.target.value))
                  }
                />
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

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={defender.enaco}
                  onChange={(e) =>
                    handleDefenderChange('enaco', e.target.checked)
                  }
                />
                <span>エナコ</span>
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
