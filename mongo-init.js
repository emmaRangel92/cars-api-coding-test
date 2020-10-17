db.createUser({
  user: 'caruser',
  pwd: '123456',
  roles: [
    {
      role: 'readWrite',
      db: 'carAPI'
    }
  ]
})