const bcrypt = require('bcryptjs')
const db = require('../database/models')
const AdClient = require('../ldap/adClient')

class Users {
  constructor (username) {
    this.username = username
  }

  async _getUserEntity () {
    if (this.user !== undefined) {
      return this.user
    } else {
      try {
        const user = await db.User.findOne({ where: { username: this.username } })
        if (user === null) {
          throw new Error('User Not Found')
        }
        this.user = user
        return this.user
      } catch (error) {
        console.log(error)
      }
      
    }
  }

  async checkLDAPPassword (plainPassword, callback) {
    let username = this.username;
    if(this.username.indexOf('@') === 0) {
      username = username.substr(1)
    }

    const option = await db.LdapOptions.findOne(({ where: { id: 1 }, attributes: ['TypeGroupe',
        'protocole',
        'adresse',
        'port',
        'DN',
        'mdp','user','groupe','base'] }))

        let client;
        if(option.TypeGroupe === 'ad') {
            client = new AdClient(option.TypeGroupe, option.protocole, option.adresse, option.port, option.DN, option.mdp, option.base, option.user, option.groupe )
          } else if(option.TypeGroupe === 'ldap') {
            //ToDo
            throw 'ToDo'
        } else {
            throw 'inccorect TypeGroupe'
        }
        await client.autentification(username, plainPassword, function(response) { 
          return callback(response)
        })
  }

  async checkLocalPassword (plainPassword, callback) {
    const user = await this._getUserEntity()
    const check = await bcrypt.compare(plainPassword, user.password).catch(() => { return false })
    return callback(check)
  }

  async checkPassword (plainPassword, callback) {
   
    const mode = await db.Option.findOne({ 
      attributes: ['ldap'],
      where: {id: '1'}
    });

    try {
        if(mode.ldap && this.username.indexOf('@') !== -1) {
          //LDAP user
          await this.checkLDAPPassword(plainPassword, async function(response) {
            return await callback(response)
          });

        } else {
          //Local user
          await this.checkLocalPassword(plainPassword, async function(response) {
            return await callback(response)
          });
          
        }
    } catch(err) {
      console.log(err)
    }
  }

  async isAdmin () {
    const user = await this._getUserEntity()
    return user.admin
  }

  static async createUser (body) {

    if(body.username.indexOf('@') !== -1) throw new Error('@ is forbiden') 

    const saltRounds = 10
    let id = null
    await db.User.max('id').then(max => id = max + 1).catch((error) => console.log(error))
    const promise = bcrypt.hash(body.password, saltRounds).then(function (hash) {
      db.User.create({
        id: id,
        username: body.username,
        first_name: body.firstName,
        last_name: body.lastName,
        mail: body.mail,
        password: hash,
        role: body.role,
        admin: false
      }).catch(e => console.log(e))
    })

    return promise
  }

  static async deleteUser (username) {
    let user = new Users(username)
    
    if(await user.isAdmin()) throw 'Can\'t delete superAdmin'
  
    try {
      await db.User.destroy({
      where: {
          username: username
       }
    })
    } catch (error) {
      console.log(error)
    }
  }

  static async modifyUser(data){
    if(data.username.indexOf('@') !== -1) throw '@ is forbiden'

    let user = new Users(data.username)
    
    if(await user.isAdmin() && data.role !=='admin') throw 'Can\'t modify superAdmin\'s role'

    const saltRounds = 10

    if(data.password !== null) {
      try {
        const promise = bcrypt.hash(data.password, saltRounds).then(function (hash) {db.User.upsert({
          id: data.id,
          password: hash
        })
      })
      } catch (error) {
        console.log(error)
      }
    }

  try { 
    await db.User.upsert({
      id: data.id,
      username: data.username, 
      isAdmin: data.admin, 
      first_name: data.first_name, 
      last_name: data.last_name, 
      mail: data.mail, 
      role: data.role
    })
  } catch (error) {
    console.log(error)
  }
}

  static async getUsers(){
    
    let users;
    
    try{
        users = await db.User.findAll({
        attributes: ['id', 'username', 'first_name', 'last_name', 'admin', 'mail', 'role']
      })
      if (users === null) {
        throw new Error('User Not Found')
      }
      } catch (error) {
        console.log(error)
    } finally {
      return users
    }
  
  }

  async getInfoUser(){
    let user;
    
    try {
        user = await db.User.findOne({ 
        where: {username: this.username}
      });
      if (user === null) {
        throw new Error('User Not Found')
      }
      } catch(error) {
        console.log(error)
    } finally {
      return user
    }
    
  }

  async getLocalUserRight(callback) {
    let rights;

    try {
      const user = await db.User.findOne({ 
        attributes: ['role'],
        where: {username: this.username}
      });

      if (user === null) {
        throw new Error('User Not Found')
      }

        rights = await db.Role.findOne({
        attributes: ['import', 'content', 'anon', 'export_local', 'export_extern','query', 'auto_query', 'delete', 'admin','modify'],
        where: {name: user.role}
      });

      if (rights === null) {
        throw new Error('Rights Not Found')
      }
      } catch (error) {
      console.log(error)
      } finally {
        return callback(rights)
      }
  }

  async getLDAPUserRight(callback) { 
    let username = this.username;
    if(this.username.indexOf('@') === 0) {
      username = username.substr(1)
    }

    const option = await db.LdapOptions.findOne(({ where: { id: 1 }, attributes: ['TypeGroupe',
        'protocole',
        'adresse',
        'port',
        'DN',
        'mdp','user','groupe','base'] }))

        let client;
        if(option.TypeGroupe === 'ad') {
            client = new AdClient(option.TypeGroupe, option.protocole, option.adresse, option.port, option.DN, option.mdp, option.base, option.user, option.groupe )
          } else if(option.TypeGroupe === 'ldap') {
            //ToDo
            throw 'ToDo'
        } else {
            throw 'inccorect TypeGroupe'
        }

    await client.getPermition(username, function(response) { 
      let res = {
        import:true,
        content:true,
        anon:true,
        export_local:true,
        export_extern:true,
        query:true,
        auto_query:true,
        delete:true,
        admin:true,
        modify:true
      }
      
      return callback(res)
    })
  }  

  async getUserRight(callback){
      const mode = await db.Option.findOne({ 
        attributes: ['ldap'],
        where: {id: '1'}
      });

      try {
          if(mode.ldap && this.username.indexOf('@') !== -1) {
            //LDAP user
            await this.getLDAPUserRight(async function(response) {
              return await callback(response)
            });

          } else {
            //Local user
            await this.getLocalUserRight(async function(response) {
              return await callback(response)
            });            
          }

    } catch(err) {
      console.log(err)
    }
  }

}

module.exports = Users
