const palettes = [
  { name: "Black", colors: ["#FAFAFA","#F5F5F5","#EEEEEE","#E0E0E0","#BDBDBD","#9E9E9E","#757575","#616161","#424242","#212121"] },
  { name: "Blue", colors: ["#ECF3FE","#D1E2FB","#ACCBF9","#85B2F6","#619BF3","#3E85F0","#3571CC","#2C5EAA","#234C89","#1C3C6C"] },
  { name: "Coral", colors: ["#FEF8F9","#FADDDF","#F6C5C8","#F1ABB0","#ED9298","#E97880","#BA6066","#8C484D","#5D3033","#2F181A"] },
  { name: "Evergreen", colors: ["#F2F4F4","#C0C7C7","#939F9E","#637474","#334A49","#031F1E","#021918","#021312","#010C0C","#010A0A"] },
  { name: "Green", colors: ["#EFFFE5","#D0F7C3","#ACF094","#85E962","#60E233","#3DDC06","#34BB05","#2B9C04","#237D03","#1B6303"] },
  { name: "Lime", colors: ["#FDFFFC","#F3FDF0","#EBFCE5","#E2FADA","#D9F9CE","#D0F7C3","#A6C69C","#7D9475","#53634E","#2A3127"] },
  { name: "Pink", colors: ["#F9EAF9","#F0CBF0","#E4A3E4","#D778D7","#CB4FCB","#C028C0","#A322A3","#881C88","#6D176D","#561256"] },
  { name: "Purple", colors: ["#F8F5FF","#DCD0FC","#C1ABF9","#A484F7","#885EF4","#6E3BF2","#5E32CE","#4E2AAC","#3F228A","#311B6D"] },
  { name: "Red", colors: ["#FBE8E8","#F5C9C9","#EE9E9E","#E67171","#DE4646","#D71D1D","#B71919","#991515","#7B1111","#610D0D"] },
];
const radii = ["xxxs","xxs","xs","sm","md","lg","xl","xxl","xxxl"];
const radiusValues: Record<string,string> = {xxxs:"2px",xxs:"4px",xs:"8px",sm:"10px",md:"12px",lg:"16px",xl:"20px",xxl:"24px",xxxl:"32px"};
const borders = ["xxxs","xxs","xs","sm"];
const borderValues: Record<string,string> = {xxxs:"0.5px",xxs:"1px",xs:"2px",sm:"4px"};
export default function TokensPreviewPage() {
  return (
    <main style={{padding:32,fontFamily:"Inter,sans-serif",maxWidth:1000}}>
      <h1 style={{fontSize:28,fontWeight:700,marginBottom:8}}>Lumo - Global Tokens</h1>
      <p style={{color:"#9E9E9E",marginBottom:40,fontSize:14}}>Todos os tokens exportados do Figma</p>
      <h2 style={{fontSize:18,fontWeight:600,marginBottom:20,borderBottom:"1px solid #E0E0E0",paddingBottom:8}}>Paletas de Cores</h2>
      {palettes.map(palette => (
        <div key={palette.name} style={{marginBottom:32}}>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:10,color:"#424242"}}>{palette.name}</h3>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {palette.colors.map((hex, i) => (
              <div key={i} style={{textAlign:"center"}}>
                <div style={{width:52,height:52,borderRadius:8,border:"1px solid rgba(0,0,0,0.08)",background:hex}}/>
                <p style={{fontSize:10,marginTop:4,color:"#757575"}}>{i+1}</p>
                <p style={{fontSize:9,color:"#BDBDBD"}}>{hex}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <h2 style={{fontSize:18,fontWeight:600,marginBottom:20,borderBottom:"1px solid #E0E0E0",paddingBottom:8,marginTop:40}}>Border Radius</h2>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end",marginBottom:40}}>
        {radii.map(k => (
          <div key={k} style={{textAlign:"center"}}>
            <div style={{width:52,height:52,background:"#212121",borderRadius:radiusValues[k]}}/>
            <p style={{fontSize:11,marginTop:6,color:"#757575"}}>{k}</p>
            <p style={{fontSize:10,color:"#BDBDBD"}}>{radiusValues[k]}</p>
          </div>
        ))}
      </div>
      <h2 style={{fontSize:18,fontWeight:600,marginBottom:20,borderBottom:"1px solid #E0E0E0",paddingBottom:8}}>Border Width</h2>
      <div style={{display:"flex",gap:20,alignItems:"center",marginBottom:40}}>
        {borders.map(k => (
          <div key={k} style={{textAlign:"center"}}>
            <div style={{width:52,height:52,border:`${borderValues[k]} solid #212121`,borderRadius:8}}/>
            <p style={{fontSize:11,marginTop:6,color:"#757575"}}>{k}</p>
            <p style={{fontSize:10,color:"#BDBDBD"}}>{borderValues[k]}</p>
          </div>
        ))}
      </div>
      <h2 style={{fontSize:18,fontWeight:600,marginBottom:20,borderBottom:"1px solid #E0E0E0",paddingBottom:8}}>Tipografia</h2>
      <div style={{display:"flex",flexDirection:"column",gap:20,marginBottom:40}}>
        <p style={{fontFamily:"TT Hoves Pro Trial, sans-serif",fontSize:40,fontWeight:600,lineHeight:"48px"}}>H1 - TT Hoves Pro 40px</p>
        <p style={{fontFamily:"TT Hoves Pro Trial, sans-serif",fontSize:32,fontWeight:600,lineHeight:"40px"}}>H2 - TT Hoves Pro 32px</p>
        <p style={{fontFamily:"TT Hoves Pro Trial, sans-serif",fontSize:28,fontWeight:600,lineHeight:"36px"}}>H3 - TT Hoves Pro 28px</p>
        <p style={{fontFamily:"TT Hoves Pro Trial, sans-serif",fontSize:24,fontWeight:600,lineHeight:"32px"}}>H4 - TT Hoves Pro 24px</p>
        <p style={{fontFamily:"TT Hoves Pro Trial, sans-serif",fontSize:20,fontWeight:600,lineHeight:"28px"}}>H5 - TT Hoves Pro 20px</p>
        <p style={{fontFamily:"Inter, sans-serif",fontSize:18,fontWeight:400,lineHeight:"28px"}}>Body Large - Inter 18px Regular</p>
        <p style={{fontFamily:"Inter, sans-serif",fontSize:16,fontWeight:400,lineHeight:"24px"}}>Body Medium - Inter 16px Regular</p>
        <p style={{fontFamily:"Inter, sans-serif",fontSize:14,fontWeight:400,lineHeight:"20px"}}>Body Small - Inter 14px Regular</p>
        <p style={{fontFamily:"Inter, sans-serif",fontSize:18,fontWeight:600,lineHeight:"28px"}}>Button Large - Inter 18px Semibold</p>
        <p style={{fontFamily:"Inter, sans-serif",fontSize:16,fontWeight:600,lineHeight:"24px"}}>Button Small - Inter 16px Semibold</p>
        <p style={{fontFamily:"Inter, sans-serif",fontSize:12,fontWeight:600,lineHeight:"16px",letterSpacing:"0.4px"}}>X Small - Inter 12px Semibold</p>
      </div>
      <h2 style={{fontSize:18,fontWeight:600,marginBottom:20,borderBottom:"1px solid #E0E0E0",paddingBottom:8}}>Font Weights</h2>
      <div style={{display:"flex",gap:32,marginBottom:40}}>
        {[{name:"Regular",w:400},{name:"Medium",w:500},{name:"Semibold",w:600},{name:"Bold",w:700}].map(fw => (
          <div key={fw.name} style={{textAlign:"center"}}>
            <p style={{fontSize:32,fontWeight:fw.w,fontFamily:"Inter, sans-serif"}}>Aa</p>
            <p style={{fontSize:12,color:"#757575",marginTop:4}}>{fw.name}</p>
            <p style={{fontSize:11,color:"#BDBDBD"}}>{fw.w}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
