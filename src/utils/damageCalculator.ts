/**
 * ラグナロクオンラインのダメージ計算ロジック
 */

export interface DamageInput {
  atk: number;           // 攻撃力
  matk: number;          // 魔法攻撃力
  def: number;           // 防御力
  mdef: number;          // 魔法防御力
  level: number;         // レベル
  skillAtk: number;      // スキル攻撃倍率（%）
  cardDamage: number;    // カード及びセット効果（%）
  elementalModifier: number;  // 属性修正（%）
  sizeModifier: number;  // サイズ修正（%）
  isPhysical: boolean;   // 物理攻撃か魔法攻撃か
}

export interface DamageOutput {
  minDamage: number;
  maxDamage: number;
  avgDamage: number;
}

/**
 * 物理ダメージを計算
 */
function calculatePhysicalDamage(input: DamageInput): DamageOutput {
  const baseAtk = input.atk;
  const targetDef = input.def;
  
  // 防御力減減率
  const defReduction = targetDef / (targetDef + 100);
  
  // 基本ダメージ（防御力を考慮）
  const baseDmg = baseAtk * (1 - defReduction);
  
  // スキル倍率を適用
  let skillDmg = baseDmg * (input.skillAtk / 100);
  
  // カード効果を適用
  skillDmg = skillDmg * (1 + input.cardDamage / 100);
  
  // 属性修正を適用
  skillDmg = skillDmg * (1 + input.elementalModifier / 100);
  
  // サイズ修正を適用
  skillDmg = skillDmg * (1 + input.sizeModifier / 100);
  
  // 変動幅（±10%）
  const minDamage = Math.floor(skillDmg * 0.9);
  const maxDamage = Math.floor(skillDmg * 1.1);
  const avgDamage = Math.floor((minDamage + maxDamage) / 2);
  
  return {
    minDamage: Math.max(0, minDamage),
    maxDamage: Math.max(0, maxDamage),
    avgDamage: Math.max(0, avgDamage),
  };
}

/**
 * 魔法ダメージを計算
 */
function calculateMagicalDamage(input: DamageInput): DamageOutput {
  const baseMAtk = input.matk;
  const targetMDef = input.mdef;
  
  // 魔法防御力減減率
  const mdefReduction = Math.max(0, 1 - targetMDef / (targetMDef + 100));
  
  // 基本ダメージ（魔法防御力を考慮）
  const baseDmg = baseMAtk * mdefReduction;
  
  // スキル倍率を適用
  let skillDmg = baseDmg * (input.skillAtk / 100);
  
  // カード効果を適用
  skillDmg = skillDmg * (1 + input.cardDamage / 100);
  
  // 属性修正を適用
  skillDmg = skillDmg * (1 + input.elementalModifier / 100);
  
  // 魔法スキルはサイズ補正がない場合が多い
  
  // 変動幅（±10%）
  const minDamage = Math.floor(skillDmg * 0.9);
  const maxDamage = Math.floor(skillDmg * 1.1);
  const avgDamage = Math.floor((minDamage + maxDamage) / 2);
  
  return {
    minDamage: Math.max(0, minDamage),
    maxDamage: Math.max(0, maxDamage),
    avgDamage: Math.max(0, avgDamage),
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
