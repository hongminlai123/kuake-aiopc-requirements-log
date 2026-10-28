'use strict';
const sample='客户：我们需要3条产品短视频，每条60秒。\n画面比例是竖屏9:16，交付1080×1920的MP4。\n我们提供产品实物、品牌介绍和已核实参数。\n希望资料齐备后7天交付，预算需要看报价再定。\n先给脚本确认，再拍摄剪辑，包含2轮集中修改。\n背景音乐和封面由谁提供，还要再商量。';
let baseline=[],changes=[],baselineProject='',baselineParty='';
W.mount({...TOOL,demo:()=>{W.set('project','产品短视频制作');W.set('party','示例客户');W.set('raw',sample);W.set('change','新增一张竖版视频封面，尺寸及费用待双方确认');W.set('impact','预计增加半天工作量，报价待确认');}});
W.add(W.row(W.field('project','项目名称','text'),W.field('party','客户或联系人','text')),W.field('raw','粘贴沟通原文','textarea','','本地模式按行整理原始要求，不猜测未说清的意思；可在右侧编辑结果'),W.field('acceptance','补充验收条件','textarea','','如格式、数量、清晰度、确认人、反馈期限'));
const detail=W.h('details',{},[W.h('summary',{text:'记录后续需求变更',style:'cursor:pointer;margin-bottom:15px'})]);
detail.append(W.row(W.field('kind','变更类型','select','新增','',['新增','修改','取消']),W.field('ref','关联需求ID（可选）','text','','如R001')),W.field('change','变更说明','textarea'),W.field('impact','工期、费用或交付影响','textarea'),W.field('confirmed','确认状态','select','待客户确认','',['待客户确认','双方已确认','暂不执行']));detail.append(W.h('button',{class:'small',text:'添加变更记录',onclick:()=>W.guarded(()=>{if(!baseline.length)throw Error('请先整理一次需求，建立基线');if(!W.value('change'))throw Error('请填写变更说明');const ref=W.value('ref');if(ref&&!baseline.some(r=>r.id===ref))throw Error('关联需求ID不存在，请填写如R001的有效编号');changes.push({id:'C'+String(changes.length+1).padStart(3,'0'),date:new Date().toLocaleString('zh-CN'),kind:W.value('kind'),ref:ref||'未指定',content:W.value('change'),impact:W.value('impact')||'待评估',confirmed:W.value('confirmed')});render();W.status('变更已记录，原需求基线保留，关闭页面前请导出');})}));W.add(detail);
function render(){
 const d=W.data(),unknown=baseline.filter(r=>/待|再定|商量|确认|是否|能否|预算|希望/.test(r.text));
 const text=`# ${baselineProject} · 客户需求确认单\n客户/联系人：${baselineParty||'待确认'}\n状态：草稿，需双方确认\n整理模式：按行保留原文，不等同于AI理解或客户已确认\n\n## 需求基线\n${baseline.map(r=>'- '+r.id+' ['+r.tag+'] '+r.text).join('\n')}\n\n## 待确认问题\n${unknown.length?unknown.map(r=>'- '+r.id+'：'+r.text).join('\n'):'- 请人工检查数量、范围、日期、价格与修改边界是否完整'}\n- 未在原文明确的内容均不视为双方已约定\n\n## 验收清单\n${baseline.filter(r=>r.tag==='交付规格').map(r=>'- '+r.id+'：'+r.text).join('\n')||'- 交付规格待确认'}\n${d.acceptance||'- 补充验收条件、确认人和反馈期限待确认'}\n\n## 需求变更记录\n${changes.length?changes.map(c=>`### ${c.id} · ${c.kind} · ${c.confirmed}\n日期：${c.date}\n关联需求：${c.ref}\n说明：${c.content}\n影响：${c.impact}`).join('\n\n'):'暂无变更。后续调整请展开左侧“记录后续需求变更”添加。'}\n\n## 双方确认\n- 客户确认人、确认日期：待填写\n- 服务方确认人、确认日期：待填写\n- 待确认变更不会自动写入已确认基线`;
 W.setResult(text);
}
W.onRun(()=>{
 const d=W.data();if(!d.project||!d.raw)throw Error('请填写项目名称和沟通原文');
 const lines=d.raw.split('\n').map(s=>s.trim()).filter(Boolean),next=lines.map((text,i)=>({id:'R'+String(i+1).padStart(3,'0'),text,tag:/比例|分辨率|格式|MP4|PNG|尺寸|交付|条|分钟|秒|像素/i.test(text)?'交付规格':/提供|素材|实物/.test(text)?'资料分工':/预算|费用|价格|报价/.test(text)?'费用':/修改|轮/.test(text)?'修改范围':'其他要求'}));
 if(changes.length&&JSON.stringify(next)!==JSON.stringify(baseline))throw Error('已有变更记录，不能覆盖原始基线。请先导出文档，再刷新页面建立新项目');baseline=next;baselineProject=d.project;baselineParty=d.party;render();W.status('已保留'+baseline.length+'条原始要求并分配需求ID，可继续记录变更');
});
W.onAI(async()=>{const d=W.data();if(!d.raw)throw Error('请粘贴沟通原文');const text=await W.generate(W.aiPrompt('仅根据原文生成客户需求确认单，包括编号需求、原文依据、待确认问题、交付规格、资料分工、验收条件。区分客户期望与已约定，不把建议自动当成承诺。输出后标注待双方确认。本次为AI整理文档，不修改本地基线及变更记录。',d));W.setResult(text);});
