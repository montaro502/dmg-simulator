/**
 * ラグナロクオンラインのダメージ計算ロジック
 */

export interface DamageInput {
  atk: number;           // 攻撃力
  str: number;           // Str
  matk: number;          // 魔法攻撃力
  def: number;           // DEF（防御力）
  mdef: number;          // MDEF（魔法防御力）
  res: number;           // RES（レジスタンス）
  mres: number;          // MRES
  skillAtk: number;      // スキル攻撃倍率（%）
  bossResistance: number;       // ボス耐性
  sizeResistance: number;       // サイズ耐性
  raceResistance: number;       // 種族耐性
  elementResistance: number;    // 属性耐性
  isPhysical: boolean;   // 物理攻撃か魔法攻撃か
}

export interface DamageOutput {
  minDamage: number;
  maxDamage: number;
  avgDamage: number;
}

/**
 * 防御力による軽減率を計算（物理攻撃）
 * 軽減率(%) = 100-((4000 + DEF) / (4000 + DEF * 10)*100)
 */
function calcDefReduction(def: number): number {
  return 100 - ((4000 + def) / (4000 + def * 10) * 100);
}

/**
 * MDEF による軽減率を計算（魔法攻撃）
 * 軽減率(%) = 100-((1000 + MDEF) / (1000 + MDEF * 10)*100)
 */
function calcMdefReduction(mdef: number): number {
  return 100 - ((1000 + mdef) / (1000 + mdef * 10) * 100);
}

/**
 * RES による軽減率を計算（物理攻撃）
 * 軽減率 = 1 - (2000 + Res) / (2000 + Res * 5)
 */
function calcResReduction(res: number): number {
  return 1 - (2000 + res) / (2000 + res * 5);
}

/**
 * MRES による軽減率を計算（魔法攻撃）
 * 軽減率 = 1 - (2000 + Mres) / (2000 + Mres * 5)
 */
function calcMresReduction(mres: number): number {
  return 1 - (2000 + mres) / (2000 + mres * 5);
}

/**
 * 耐性による軽減率を計算
 */
function calcResistanceReduction(resistance: number): number {
  return resistance / 100;
}

/**
 * 物理ダメージを計算
 */
function calculatePhysicalDamage(input: DamageInput): DamageOutput {
  const ratio = input.skillAtk / 100;
  
  // 基本ダメージ = (Str * 倍率) + (Atk * 倍率)
  const strDamage = input.str * ratio;
  const atkDamage = input.atk * ratio;
  
  // 耐性軽減（種族耐性と属性耐性は両方に適用）
  const raceResist = calcResistanceReduction(input.raceResistance);
  const elementResist = calcResistanceReduction(input.elementResistance);
  
  // Atk部分への軽減
  let atkAfterResist = atkDamage * (1 - raceResist) * (1 - elementResist);
  
  // ボス耐性とサイズ耐性はAtkだけに適用
  const bossResist = calcResistanceReduction(input.bossResistance);
  const sizeResist = calcResistanceReduction(input.sizeResistance);
  atkAfterResist = atkAfterResist * (1 - bossResist) * (1 - sizeResist);
  
  // Str部分への軽減（種族耐性と属性耐性のみ）
  let strAfterResist = strDamage * (1 - raceResist) * (1 - elementResist);
  
  // DEF軽減
  const defReduction = calcDefReduction(input.def) / 100;
  atkAfterResist = atkAfterResist * (1 - defReduction);
  
  // RES軽減
  const resReduction = calcResReduction(input.res);
  const totalDamage = (strAfterResist + atkAfterResist) * (1 - resReduction);
  
  // 変動幅（±10%）
  const minDamage = Math.floor(totalDamage * 0.9);
  const maxDamage = Math.floor(totalDamage * 1.1);
  const avgDamage = Math.floor((minDamage + maxDamage) / 2);
  
  return {
    minDamage: Math.max(1, minDamage),
    maxDamage: Math.max(1, maxDamage),
    avgDamage: Math.max(1, avgDamage),
  };
}

/**
 * 魔法ダメージを計算
 */
function calculateMagicalDamage(input: DamageInput): DamageOutput {
  const ratio = input.skillAtk / 100;
  
  // 基本ダメージ = Matk * 倍率
  let damage = input.matk * ratio;
  
  // 耐性軽減（すべて適用）
  const bossResist = calcResistanceReduction(input.bossResistance);
  const sizeResist = calcResistanceReduction(input.sizeResistance);
  const raceResist = calcResistanceReduction(input.raceResistance);
  const elementResist = calcResistanceReduction(input.elementResistance);
  
  damage = damage * (1 - bossResist) * (1 - sizeResist) * (1 - raceResist) * (1 - elementResist);
  
  // MDEF軽減
  const mdefReduction = calcMdefReduction(input.mdef) / 100;
  damage = damage * (1 - mdefReduction);
  
  // MRES軽減
  const mresReduction = calcMresReduction(input.mres);
  damage = damage * (1 - mresReduction);
  
  // 変動幅（±10%）
  const minDamage = Math.floor(damage * 0.9);
  const maxDamage = Math.floor(damage * 1.1);
  const avgDamage = Math.floor((minDamage + maxDamage) / 2);
  
  return {
    minDamage: Math.max(1, minDamage),
    maxDamage: Math.max(1, maxDamage),
    avgDamage: Math.max(1, avgDamage),
  };
}

/**
 * ダメージを計算
 */
export function calculateDamage(input: DamageInput): DamageOutput {
  if (input.isPhysical) {
    return calculatePhysicalDamage(input);
  } else {
    return calculateMagicalDamage(input);
  }
}

