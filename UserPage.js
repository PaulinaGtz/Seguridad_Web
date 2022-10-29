import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from './config';

function User({user, editable, deleteUser}){
  const [active, setActive] = useState(user.is_active)
  function clickEvent(e){
    setActive(!active);
  }
  function clickDelete(){
    deleteUser(user.id)
  }
  return (
    <a href="#" className={"list-group-item list-group-item-action "+(active ? "active" : "")} aria-current="true">
      <div className="d-flex w-100 justify-content-between">
        <h5 className="mb-1">{user.github_user}</h5>
        <small>{active ? "Active" : "Inactive"}</small>
      </div>
      <p className="mb-1">{user.email}</p>
      {editable ?
      <><button onClick={clickEvent} type="button"
        className={active ? "btn btn-primary" : "btn btn-outline-primary"}>
          {active ? "Deactivate" : "Activate"}
      </button>
      <button onClick = {clickDelete} type="button"
        className="btn btn-danger">Delete
      </button>
      </>
      :<></>}
  </a>
  )
}

function UserList({users, editable, deleteUser}){
  return <div classNameName="list-group">
    {users.map((user) => <User user={user} editable={editable} deleteUser={deleteUser} key={user.email}></User>)}
  </div>
}

function UserForm ({ createUser}) {
  let email = useRef("")
  let password = useRef("")
  let githubUser = useRef("")
  function clickCreate(e){
    e.presentDefault();
    let data = {
      email: email.current.value,
      password: password.current.value,
      github_user: githubUser.current.value
    }
    createUser(data)
    email.current.value = ""
    password.current.value = ""
    githubUser.current.value = ""
  }
  return (
    <form onSubmit={clickCreate}>
      <div className="mb-3">
        <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
        <input ref={email} type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"/>
      </div>
      <div className="mb-3">
        <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
        <input ref={password} type="password" className="form-control" id="exampleInputPassword1"/>
      </div>
      <div className="mb-3">
        <label htmlFor="github-user" className="form-label">Github User</label>
        <input ref={githubUser} type="text" className="form-control" id="github-user"/>
      </div>
      <button type="submit" className="btn btn-primary">Create</button>
    </form>
  )
}

function UserPage({token}) {
  const [users, setUsers] = useState([])
  useEffect(() => {
    let succesful = false
        fetch(API_URL+"/users/")
        .then((data) => {
          if (data.status === 200) {
            succesful = true
        }
        return data.json()
        })
        .then((data) => {
            if (succesful) {
                setUsers(data)
            } else{
                throw new Error(data.detail)
            }
        })
        .catch((data) => alert(data))
    }, [])
    function deleteUser(user_id){
      let succesful = false;
        fetch(API_URL+"/users/"+user_id, {
          method: "DELETE"
        })
        .then((data) => {
          if (data.status === 200) {
            succesful = true
        }
        return data.json()
        })
        .then((data) => {
        if (succesful) {
            setUsers(users.filter((user) => user.id !== user_id))
        } else{
            throw new Error(data.detail)
        }
      })
      .catch((data) => alert(data))
    }
    function createUser(userData) {
      let succesful = false;
      fetch(API_URL+"/users/", {
        method: "POST",
        headers: {
          "Autorization": "Bearer " +token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      })
      .then((data) => {
        console.log(data)
        if (data.status === 200) {
          succesful = true
        }
        return data.json()
      })
      .then((data) => {
        if (succesful) {
            setUsers([...users, data])
        }else{
        throw new Error(data.detail)
        }
      })
      .catch((data) => alert(data))
    }
    console.log("Rendering User List")
    return (
    <>
      <h1>User List</h1>
      <UserList users={users} editable={!token} deleteUser={deleteUser}></UserList>
      {!!token ?
      <>
      <h3>Add new user</h3>
      <UserForm createUser={createUser}></UserForm>
      </> : <></>}
    </>
  );
}

export default UserPage;
