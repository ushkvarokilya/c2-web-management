// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  commercialPageDomain: 'https://c2communities.com/',
  api_endpoint: "https://c2-dev-server.appspot.com/_ah/api",
  // cloudinary_cloud_name: "maatayem",
  // cloudinary_cert: 'cet7owh3',
  // cloudinary_api_key: "311865418119719",
  cloudinary_cloud_name: "c2members",
  cloudinary_cert: 'rz850maa',
  cloudinary_api_key: "593943879833819",
  google_api_key: "AIzaSyAQE7IgzoPXNhsZqV9smKnCFx_agX_Nnyg",
  stripe_client_id: "ca_BwOh3DndHVaDZKyEtbqxAof6ewLyApDp",
  vendor_api_endpoint : "https://maintenanceplusdev.appspot.com/api/",
  //vendor_api_endpoint : "http://localhost:8080/api/",
  redirect_url_vendors : "https://c2-dev-server.firebaseapp.com/maintenancePlus/",
  firebase: {
    apiKey: 'AIzaSyAXqdv3S06g-cz1MEgKTf-kIpu-Albp3zM',
    authDomain: 'vendors-ad641.firebaseapp.com',
    databaseURL: 'https://vendors-ad641.firebaseio.com',
    projectId: 'vendors-ad641',
    storageBucket: 'vendors-ad641.appspot.com',
    messagingSenderId: '229391124345'
  },
  accounting_api_endpoint : "https://dev.c2communities.com/api/"
  //accounting_api_endpoint : "http://localhost:59422/api/"
};
