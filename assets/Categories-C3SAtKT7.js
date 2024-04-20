import{d as A,r as f,a as M,u as j,b as a,o as D,c as O,w as n,e as o,f as w,g as l,h as P,i as E,j as X,p as G,k as H,l as k,_ as F,m as J,n as z,q as N,C as K,F as T,s as Q,t as R,v as W,x as L}from"./index-DlkBQzAi.js";const Y=y=>(G("data-v-feed2d65"),y=y(),H(),y),Z=Y(()=>l("h1",{class:"headline white--text"},"Category Dialog",-1)),ee={class:"whole-categories-container"},oe={class:"radio-buttons"},te={class:"name-input"},ae={class:"bottom-buttons"},ne=A({__name:"CategoryDialog",setup(y,{expose:C}){const u=f("income"),_=f(!1),c=M({...{name:""}}),v=j({name:{required:X}},c);async function V(){if(!v.value.$invalid)try{await k.categories.add({name:c.name,type:u.value}),h()}catch(I){console.error(`Error saving category: ${I}`)}}const i=()=>{_.value=!0},h=()=>{_.value=!1};return C({showDialog:i,close:h}),(I,r)=>{const x=a("v-icon"),m=a("v-btn"),g=a("v-card-title"),e=a("v-radio"),t=a("v-radio-group"),d=a("v-text-field"),p=a("v-form"),s=a("v-card-text"),q=a("v-card"),U=a("v-dialog");return D(),O(U,{modelValue:_.value,"onUpdate:modelValue":r[2]||(r[2]=S=>_.value=S),"max-width":"500px"},{default:n(()=>[o(q,{class:"dialog-card"},{default:n(()=>[o(g,{class:"dialog-header"},{default:n(()=>[Z,o(m,{style:{"background-color":"#00193b",color:"white"},size:"x-small",icon:"",onClick:h},{default:n(()=>[o(x,null,{default:n(()=>[w("mdi-close")]),_:1})]),_:1})]),_:1}),o(s,null,{default:n(()=>[l("div",ee,[o(p,{onSubmit:P(V,["prevent"])},{default:n(()=>{var S;return[l("div",oe,[o(t,{label:"Category Type",modelValue:u.value,"onUpdate:modelValue":r[0]||(r[0]=$=>u.value=$)},{default:n(()=>[o(e,{color:"primary",label:"Income",value:"income"}),o(e,{color:"primary",label:"Expense",value:"expense"})]),_:1},8,["modelValue"])]),l("div",te,[o(d,{"error-messages":(S=E(v).name.$errors)==null?void 0:S.map($=>$.$message).join(", "),clearable:"",onBlur:E(v).name.$touch,onInput:E(v).name.$touch,counter:10,label:"Category Name",modelValue:c.name,"onUpdate:modelValue":r[1]||(r[1]=$=>c.name=$)},null,8,["error-messages","onBlur","onInput","modelValue"])]),l("div",ae,[o(m,{color:"rgb(12, 56, 84)",size:"small",type:"button",onClick:h},{default:n(()=>[w(" Cancel ")]),_:1}),o(m,{color:"rgb(12, 56, 84)",size:"small",type:"submit",onClick:E(v).$validate},{default:n(()=>[w(" Save Category ")]),_:1},8,["onClick"])])]}),_:1})])]),_:1})]),_:1})]),_:1},8,["modelValue"])}}}),se=F(ne,[["__scopeId","data-v-feed2d65"]]),le={class:"whole-category-list"},ie={class:"revenue-table"},ce={class:"income-expense-buttons"},re=["onClick"],de={class:"delete-icon"},ue=A({__name:"CategoryList",emits:["category-selected"],setup(y,{expose:C,emit:u}){const _=u,b=f(null);function c(){i.value&&B(i.value)}function B(e){e&&e.id&&k.records.where({category_id:e.id}).delete().then(()=>{k.categories.delete(e.id).then(()=>{g(x.value?"income":"expense")})})}function v(){b.value.showDialog()}const V=M({categories:[]}),i=f(null);function h(e){i.value=e,console.log(i),_("category-selected",i.value)}function I(e){L(()=>k.categories.where({id:e}).toArray()).subscribe(d=>{const p=d[0],s=p.type;s&&(p&&(i.value=p),g(s))})}C({selectCategoryById:I});function r(e){var t;return((t=i.value)==null?void 0:t.id)===e.id}const x=f(!1),m=f(!1);function g(e){L(()=>k.categories.where({type:e}).toArray()).subscribe(d=>{V.categories=d}),e==="income"?(x.value=!0,m.value=!1):e==="expense"&&(x.value=!1,m.value=!0)}return J(()=>{g("income")}),(e,t)=>{const d=a("v-btn"),p=a("v-icon");return D(),z("div",le,[l("div",ie,[l("div",ce,[o(d,{class:N([{active:x.value},"income-button"]),variant:"text",size:"large",onClick:t[0]||(t[0]=s=>g("income"))},{default:n(()=>[w("INCOME")]),_:1},8,["class"]),o(d,{class:N([{active:m.value},"expense-button"]),variant:"text",size:"large",onClick:t[1]||(t[1]=s=>g("expense"))},{default:n(()=>[w("EXPENSE")]),_:1},8,["class"])]),o(K,{ref_key:"confirmationDialog",ref:b,action:"Category",associated:"Deleting the category will remove all the associated records!",onConfirmed:c},null,512),(D(!0),z(T,null,Q(V.categories,s=>(D(),z("div",{onClick:q=>h(s),key:s.id,class:N({"categories-results":!0,active:r(s)})},[l("div",null,R(s.name),1),l("span",de,[l("button",{onClick:t[2]||(t[2]=q=>v())},[o(p,{size:"x-small"},{default:n(()=>[w("mdi-delete")]),_:1})])])],10,re))),128))]),W(e.$slots,"default",{},void 0,!0)])}}}),_e=F(ue,[["__scopeId","data-v-4cd981ae"]]),ve={class:"categories-container"},me=A({__name:"Categories",setup(y){const C=f(null);function u(){C.value.showDialog()}return(_,b)=>{const c=a("v-btn");return D(),z(T,null,[l("div",ve,[o(_e),o(c,{variant:"elevated",color:"#56CFE1",icon:"mdi-plus",class:"add-category-button",onClick:b[0]||(b[0]=B=>u())})]),o(se,{ref_key:"categoryDialog",ref:C},null,512)],64)}}}),pe=F(me,[["__scopeId","data-v-92fdf2f8"]]);export{pe as default};