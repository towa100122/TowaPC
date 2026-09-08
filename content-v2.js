// 通常の情報更新は data フォルダー内のCSVを編集してください。
// 以下はCSVが読み込めなかった場合にも表示を保つための予備データです。
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
  // CSV読み込み前に表示する予備データです。
  partners:[
    {name:'Arielogic',role:'協力団体',description:'TowaPCはArielogicに協力しています。',image:'/assets/partner-sample.svg',url:''}
  ],
  members:[
    {name:'towa',role:'リーダー',description:'TowaPCのリーダー。2022年からScratchを始め、2026年にほぼ引退。主にUIデザインが得意です。現在、NekoBousaiNowという防災ソフトを開発中です。プログラミングはまだ乏しいですが、出来るように勉強していきます。',image:'/assets/member-towa.png',url:''}
  ]
};
