// サイトの文章・画像・外部リンクは、このファイルから変更できます。
window.SITE={
  logo:'/assets/TowaPC.svg',hero:'/assets/hero-original.jpg',headline:"Toward Solving Humanity’s Timeless Challenges.",
  description:'人類の普遍的な課題を、テクノロジーで解決する未来へ。小さな気づきと自由な発想を大切に、暮らしを少し豊かにするものづくりを目指します。',
  joinUrl:'',contactUrl:'',socials:{youtube:'',x:'',discord:''},
  // imageのSVGを同じファイル名で置き換えると、ホームと製品ページの両方に反映されます。
  products:[
    {id:'workspace',name:'毎日を、もっとスムーズに。',category:'アプリケーション',type:'app',description:'日々の作業を心地よくする、シンプルで使いやすいツール。',color:'lavender',image:'/assets/product-workspace.svg'},
    {id:'connect',name:'つながりから、新しい発見を。',category:'Webサービス',type:'web',description:'アイデアや情報が行き交う、新しいコミュニケーションのかたち。',color:'mint',image:'/assets/product-connect.svg'},
    {id:'lab',name:'「あったらいいな」を、かたちに。',category:'開発プロジェクト',type:'project',description:'未来の可能性を探る、小さな実験とものづくり。',color:'peach',image:'/assets/product-lab.svg'}
  ],
  // imageは空欄で画像なし。SVG・PNG・JPGを指定できます。
  news:[
    {id:'welcome',date:'2026.07.19',tag:'NEW',title:'TowaPCのWebサイトへようこそ',body:'TowaPCの活動や製品について、このWebサイトからお伝えしていきます。',image:'/assets/news-welcome.svg'},
    {id:'updates',date:'2026.07.19',tag:'Important',title:'今後のお知らせについて',body:'製品や活動に関する大切な情報を、お知らせページに掲載していく予定です。',image:''},
    {id:'products',date:'2026.07.19',tag:'Release',title:'製品紹介ページを公開しました',body:'製品紹介ページでは、取り組んでいるものづくりをご紹介します。',image:''}
  ],
  // {name,role,description,image,url} の形式で追加します。
  partners:[],members:[]
};
