const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExists = users.find(user => user.username=== username)
  if(!userExists){
    return response.status(400).json({error:'user not exists'})
  }
  request.user = userExists
  return next()
}

app.post('/users', (request, response) => {
  const {name, username } =request.body

 const userExists =users.find(user => user.username=== username)

 if(userExists){
   return response.status(400).json({error:'user exists'})
 }
  const user ={
    name,
    username,
    id: uuidv4(),
    todos: []
  }
  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user
  const userExist =  users.find(use=>{
      if(use.id === user.id){
        return use
      }
    })
  return response.json(userExist.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user
  const {title,deadline, username}=request.body
  const tudo={
    id: uuidv4(),
    done: false,
    title,
    deadline, 
    created_at:new Date(), 
    username: username
  }
  users.map(use=>{
    if(use.username === user.username){
      return {
        ...use,
        todos: use.todos.push(tudo)
      }
    }
  })
return response.status(201).json(tudo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user
 const {id: tudoId}= request.params
 const {title, deadline} = request.body
 const tudoIndex = user.todos.findIndex(todo => todo.id === tudoId)
 if(tudoIndex<0){
   return response.status(404).json({error: 'test'})
 }

let tudo = user.todos[tudoIndex]
 tudo.title= title, 
 tudo.deadline= new Date(deadline)


 return response.json(tudo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user
  const {id: tudoId}= request.params
  const tudo = user.todos.find(todo => todo.id === tudoId)
  if(!tudo){
    return response.status(404).json({error: 'test'})
  }
  const newTudo ={
    ...tudo,
    done: true,
  }


 
  return response.json(newTudo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user
  const {id: tudoId}= request.params 

 const tudoExists = user.todos.find(tudo => tudo.id === tudoId)
 if(!tudoExists) {
   return response.status(404).json({ error: 'Not Found' })
 }
 const indexTudo = user.todos.findIndex(tudo => tudo.id === tudoId)
  users.map(use =>{
   if(use.id === user.id){
     return {
       ...use,
       todos: use.todos.splice(indexTudo,1)
   }
   use
  }})
 
  return response.status(204).send()
});

module.exports = app;