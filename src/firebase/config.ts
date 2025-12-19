import { firebaseConfig as devConfig } from './firebase.dev.config';
import { firebaseConfig as prodConfig } from './firebase.prod.config';

const isProduction = process.env.NODE_ENV === 'production';

export const firebaseConfig = isProduction ? prodConfig : devConfig;
