import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar'

export const useFAZStore = defineStore(
  'fazstore',
  {
    state: () => ({

      apiUser: (LocalStorage.getItem('fazApiUser') || ""),
      fazUrl: (LocalStorage.getItem('fazUrl') || ""),

      fazPasswordMayStore: (LocalStorage.getItem('fazPasswordMayStore') || false),

      // Do not ever think about storing the password in the local storage! Only on runtime in the cache!
      fazPassword: '',

    }),
    
    getters: {

      getUrl()
      {
        return this.fazUrl;
      },

      getUser()
      {
        return this.apiUser;
      },
      
      getMayStorePwd()
      {
        return this.fazPasswordMayStore;
      },

    },

    actions: {

      storeUser(data)
      {
        const copyOfData = data;
  
        LocalStorage.set('fazApiUser', copyOfData);
        this.apiUser = copyOfData;
      },

      storeMayStorePwd(data)
      {
        const copyOfData = data;
  
        LocalStorage.set('fazPasswordMayStore', copyOfData);
        this.fazPasswordMayStore = copyOfData;
      },


      storeURL(data)
      {
        data = data.trim();
        if (data[data.length -1] == '/')
        {
          data = data.slice(0, -1);
        }
        
        const copyOfData = data;
  
        LocalStorage.set('fazUrl', copyOfData);
        this.fazUrl = copyOfData;
      },

    },
  }
);
