/**
 * ラグナロクオンラインのダメージ計算ロジック
 */
// Atkに対する最小ダメージと最大ダメージのブレ幅を定義
// ダメージは±20%のブレがあると仮定
const DAMAGE_MIN_RATIO = 0.8;
const DAMAGE_MAX_RATIO = 1.2;


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
  enaco: number;         // エナジーコート軽減率（0, 6, 12, 18, 24, 30%）
  assum: boolean;    // アスムの有無
  ukumakura: boolean;    // うずくまるの有無（80%軽減）
  kongou: boolean;       // 金剛の有無（90%軽減）
}

export interface DamageOutput {
  minDamage: number;
  maxDamage: number;
  avgDamage: number;
}

/**
 * アスムによる防御力の上昇分を計算
 * @param def Def or MDef
 * @returns アスムがある場合の追加分の防御力
 */
export function calculateAssumBonus(def: number): number {
  return def ;
}

/**
 * 防御力による軽減率を計算（物理攻撃）
 * 軽減率 = 1 - (4000 + DEF) / (4000 + DEF * 10)
 */
export function calcDefReduction(def: number, assumBonus: number): number {
  const effectiveDef = def + assumBonus;
  return 1 - (4000 + effectiveDef) / (4000 + effectiveDef * 10);
}

/**
 * MDEF による軽減率を計算（魔法攻撃）
 * 軽減率 = 1 - (1000 + MDEF) / (1000 + MDEF * 10)
 */
export function calcMdefReduction(mdef: number, assumBonus: number): number {
  const effectiveMdef = mdef + assumBonus;
  return 1 - (1000 + effectiveMdef) / (1000 + effectiveMdef * 10);
}

/**
 * RES による軽減率を計算（物理攻撃）
 * 軽減率 = 1 - (2000 + Res) / (2000 + Res * 5)
 */
export function calcResReduction(res: number): number {
  return 1 - (2000 + res) / (2000 + res * 5);
}

/**
 * MRES による軽減率を計算（魔法攻撃）
 * 軽減率 = 1 - (2000 + Mres) / (2000 + Mres * 5)
 */
export function calcMresReduction(mres: number): number {
  return 1 - (2000 + mres) / (2000 + mres * 5);
}

/**
 * 耐性による軽減率を計算
 */
export function calcResistanceReduction(resistance: number): number {
  return resistance / 100;
}

/**
 * 物理ダメージを計算
 */
function calculatePhysicalDamage(input: DamageInput): DamageOutput {
  const ratio = input.skillAtk / 100;
  
  // 基本ダメージ = (Str * 倍率) + (Atk * 倍率)
  const avgDamage = {
    strDamage: input.str * ratio,
    atkDamage: input.atk * ratio,
  };
  const minDamage = {
    strDamage: input.str * ratio,
    atkDamage: input.atk * ratio * DAMAGE_MIN_RATIO,
  };
  const maxDamage = {
    strDamage: input.str * ratio,
    atkDamage: input.atk * ratio * DAMAGE_MAX_RATIO,
  };

  const calcDamage = (damage: { strDamage: number; atkDamage: number }, input: DamageInput) => {
    // 耐性軽減（種族耐性と属性耐性は両方に適用）
    const raceResist = calcResistanceReduction(input.raceResistance);
    const elementResist = calcResistanceReduction(input.elementResistance);
    
    // Atk部分への軽減
    let atkAfterResist = damage.atkDamage * (1 - raceResist) * (1 - elementResist);
    
    // Atkにはボス耐性とサイズ耐性、種族耐性と属性耐性が適用される
    const bossResist = calcResistanceReduction(input.bossResistance);
    const sizeResist = calcResistanceReduction(input.sizeResistance);
    atkAfterResist = atkAfterResist * (1 - bossResist) * (1 - sizeResist)* (1 - raceResist) * (1 - elementResist);
    
    // Str部分には種族耐性のみが適用される
    let strAfterResist = damage.strDamage * (1 - raceResist);

    let totalDamage = atkAfterResist + strAfterResist;
    
    // DEF軽減
    let assumBonus = 0;
    if (input.assum) {
      assumBonus = calculateAssumBonus(input.def);
    }
    const defReduction = calcDefReduction(input.def, assumBonus);
    totalDamage = totalDamage * (1 - defReduction);
    
    // RES軽減
    const resReduction = calcResReduction(input.res);
    totalDamage = totalDamage * (1 - resReduction);
    
    // うずくまる軽減（80%）
    if (input.ukumakura) {
      totalDamage = totalDamage * (1 - 0.8);
    }
    
    // 金剛軽減（90%）
    if (input.kongou) {
      totalDamage = totalDamage * (1 - 0.9);
    }
    
    // エナジーコート軽減
    const enacoReduction = input.enaco / 100;
    totalDamage = totalDamage * (1 - enacoReduction);
    return totalDamage;
  };

  
  
  return {
    minDamage: calcDamage(minDamage, input),
    maxDamage: calcDamage(maxDamage, input),
    avgDamage: calcDamage(avgDamage, input),
  };
}

/**
 * 魔法ダメージを計算
 */
function calculateMagicalDamage(input: DamageInput): DamageOutput {
  const ratio = input.skillAtk / 100;
  
  // 基本ダメージ = Matk * 倍率
  let damage = input.matk * ratio;
  let minDamage = damage * DAMAGE_MIN_RATIO;
  let maxDamage = damage * DAMAGE_MAX_RATIO;
  
  const calcDamage = (damage: number, input: DamageInput) => {

    // 耐性軽減（すべて適用）
    const bossResist = calcResistanceReduction(input.bossResistance);
    const sizeResist = calcResistanceReduction(input.sizeResistance);
    const raceResist = calcResistanceReduction(input.raceResistance);
    const elementResist = calcResistanceReduction(input.elementResistance);
    
    damage = damage * (1 - bossResist) * (1 - sizeResist) * (1 - raceResist) * (1 - elementResist);
    
    // MDEF軽減
    let assumBonus = 0;
    if (input.assum) {
      assumBonus = calculateAssumBonus(input.mdef);
    }
    const mdefReduction = calcMdefReduction(input.mdef, assumBonus);
    damage = damage * (1 - mdefReduction);
    
    // MRES軽減
    const mresReduction = calcMresReduction(input.mres);
    damage = damage * (1 - mresReduction);
    
    // うずくまる軽減（80%）
    if (input.ukumakura) {
      damage = damage * (1 - 0.8);
    }
    
    // 金剛軽減（90%）
    if (input.kongou) {
      damage = damage * (1 - 0.9);
    }
    
    // エナジーコート軽減
    const enacoReduction = input.enaco / 100;
    damage = damage * (1 - enacoReduction);
    return damage;
  };
    
  return {
    minDamage: calcDamage(minDamage, input),
    maxDamage: calcDamage(maxDamage, input),
    avgDamage: calcDamage(damage, input),
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

