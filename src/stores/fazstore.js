import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar'

export const useFAZStore = defineStore(
  'fazstore',
  {
    state: () => ({

      apiUser: (LocalStorage.getItem('fazApiUser') || ""),
      fazUrl: (LocalStorage.getItem('fazUrl') || ""),

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
      

    },

    actions: {

      storeUser(data)
      {
        const copyOfData = data;
  
        LocalStorage.set('fazApiUser', copyOfData);
        this.apiUser = copyOfData;
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
