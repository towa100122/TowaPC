// サイトの文章・画像・外部リンクは、このファイルから変更できます。
window.SITE={
  logo:'/assets/TowaPC.svg',hero:'/assets/hero-original.jpg',headline:"Toward Solving Humanity’s Timeless Challenges.",
  description:'人類の普遍的な課題を、テクノロジーで解決する未来へ。小さな気づきと自由な発想を大切に、暮らしを少し豊かにするものづくりを目指します。',
  joinUrl:'',contactUrl:'mailto:contact@towapc.com',socials:{youtube:'https://www.youtube.com/@TowaPC',x:'https://x.com/TowaPC_Official',discord:'https://discord.gg/WJrAwzMp2U'},
  // imageのSVGを同じファイル名で置き換えると、ホームと製品ページの両方に反映されます。
  products:[
    {id:'workspace',name:'毎日を、もっとスムーズに。',category:'アプリケーション',type:'app',description:'日々の作業を心地よくする、シンプルで使いやすいツール。',color:'lavender',image:'/assets/product-workspace.svg'},
    {id:'connect',name:'つながりから、新しい発見を。',category:'Webサービス',type:'web',description:'アイデアや情報が行き交う、新しいコミュニケーションのかたち。',color:'mint',image:'/assets/product-connect.svg'},
    {id:'lab',name:'「あったらいいな」を、かたちに。',category:'開発プロジェクト',type:'project',description:'未来の可能性を探る、小さな実験とものづくり。',color:'peach',image:'/assets/product-lab.svg'}
  ],
  // imageは空欄で画像なし。SVG・PNG・JPGを指定できます。
  news:[
    {id:'welcome',date:'2026.09.07',tag:'NEW',title:'TowaPCのWebサイトへようこそ',body:'TowaPCの活動や製品について、このWebサイトからお伝えしていきます。',image:'/assets/news-welcome.svg'},
    {id:'updates',date:'2026.09.07',tag:'Important',title:'今後のお知らせについて',body:'製品や活動に関する大切な情報を、お知らせページに掲載していく予定です。',image:''},
    {id:'products',date:'2026.09.07',tag:'Release',title:'製品紹介ページを公開しました',body:'製品紹介ページでは、取り組んでいるものづくりをご紹介します。',image:''}
  ],
  // {name,role,description,image,url} の形式で追加します。以下の1件は入力例です。
  partners:[
    {name:'協力団体名',role:'協力団体',description:'TowaPCと協力関係にある団体・個人の紹介文を入力します。',image:'/assets/partner-sample.svg',url:''}
  ],
  members:[
    {name:'メンバー名',role:'担当・役割',description:'担当している分野や、簡単なプロフィールを入力します。',image:'/assets/member-sample.svg',url:''}
  ]
};
