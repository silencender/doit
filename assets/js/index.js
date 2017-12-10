import React from 'react';
import ReactDOM from 'react-dom';
import { observable, autorun, action } from 'mobx';
import { observer } from 'mobx-react';
import { Button, Grid, Row, Col, Form, FormGroup, FormControl, Navbar, Nav, NavItem, Checkbox, Table, ButtonGroup, Label } from 'react-bootstrap';
var DatePicker = require("react-bootstrap-date-picker");

import 'bootstrap/dist/css/bootstrap.css';
import '../css/style.css';

const api = "/api/";

class TodoStore {
    @observable todos = [];
    
    constructor() {
        this.sortBy = "date";
        fetch(api)
            .then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            }).then(data => {
                this.todos = data;
                this.sortTodo();
            }).catch(error => {
                console.log(error);
            });
    }

    @action
    sortTodo() {
        this.todos = this.todos.sort((todo1, todo2) => {
            if (this.sortBy == 'date') {
                if (new Date(todo1.expire_date) > new Date(todo2.expire_date)) return true;
                else if (todo1.expire_date == todo2.expire_date) return todo1.priority > todo2.priority;
                else return false;
            }
            else if (this.sortBy == 'priority') {
                if (todo1.priority > todo2.priority) return true;
                else if (todo1.priority > todo2.priority) return new Date(todo1.expire_date) > new Date(todo2.expire_date);
                else return false;
            }
        });
/*         this.todos = this.todos.sort((todo1, todo2) => {
            if (this.sortBy == 'date') return new Date(todo1.expire_date) > new Date(todo2.expire_date);
            else if (this.sortBy == 'priority') return todo1.priority > todo2.priority;
        }); */
    }

    addTodo(todo) {
        console.log(todo);
        todo.id != null && todo.content != "" && todo.expire_date != "" && todo.priority != "" &&
            fetch(api, { method: 'post', body: JSON.stringify(todo), headers: { 'Content-Type': 'application/json' }})
            .then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            }).then(data => {
                this.todos.push(data);
                this.sortTodo();
            }).catch(error => {
                console.log(error);
            });
    }

    setTodo(i, todo) {
        todo.id != null && todo.content != "" && todo.expire_date != "" && todo.priority != "" && todo.finished != null &&
            fetch(api + parseInt(todo.id) + "/", { method: 'put', body: JSON.stringify(todo), headers: { 'Content-Type': 'application/json' }})
                .then(response => {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }
                    return response.json();
                }).then(data => {
                    this.todos[i] = todo;
                    this.sortTodo();
                }).catch(error => {
                    console.log(error);
                });
    }

    delTodo(i) {
        fetch(api + parseInt(this.todos[i].id) + "/", {
            method: 'delete'
        })
            .then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response;
            }).then(data => {
                this.todos.splice(i, 1);
            }).catch(error => {
                console.log(error);
            });
    }
}


const todoStore = new TodoStore();

@observer
class TodoList extends React.Component {
    @observable mode = ["list",0];
    constructor(props) {
        super(props);
        this.defaultNewTodo = {
            id: 0,
            content: "",
            finished: false,
            expire_date: new Date().toISOString().substring(0,10),
            priority: "3",
        };
        this.state = {
            newTodo: Object.assign({}, this.defaultNewTodo),
            editingTodo: null,
        };
    }
    render() {
        const store = this.props.store;
        return (
            <div>
            <NavBarView />
            <Grid>
                <Row>
                    <Col><SortView store={store}/></Col>
                </Row>
                        {store.todos.map(
                            (todo, idx) => 
                                <div key={todo.id}>
                                {
                                    (this.mode[0] == "list" || this.mode[0] == "add" || (this.mode[0] == "edit" && this.mode[1] != idx)) &&
                                    <Row>
                                        <Col>
                                    <Table condensed={true}>
                                    <tbody>
                                        < TodoView todo = {todo}
                                        onClick = {() => {
                                                this.mode = ["edit",idx];
                                                const newTodo = this.state.newTodo;
                                                this.setState({
                                                    newTodo: newTodo,
                                                    editingTodo: Object.assign({}, todo)});
                                            }
                                        } onCheck = {this.handleCheck(idx)}
                                        />
                                    </tbody>
                                    </Table>
                                    </Col>
                                    </Row>
                                }
                                {        
                                    this.mode[0] == "edit" && this.mode[1] == idx &&
                                    < Row >
                                    <Col>
                                        <div>
                                            <EditTodoView todo={this.state.editingTodo} onChange={this.handleEditChange} onDatePick={this.onEditDatePick}/>
                                            <Button onClick={this.onEditTodo(idx)}>Save</Button>
                                            <Button onClick={()=>this.mode[0]="list"}>Cancel</Button>
                                            <Button onClick={this.onDelTodo(idx)}>Delete</Button>
                                        </div>
                                        </Col>
                                    </Row>
                                }
                                </div>
                                )}
                            {
                                (this.mode[0] == "list" || this.mode[0] == "edit") && 
                                <Row>
                                    <Col>< Button bsStyle="link" onClick = {() => this.mode[0] = "add"} >+ Add Todo </Button></Col>
                                </Row>
                            }
                    {
                        (this.mode[0] == "add") &&  
                    < span ><Row>
                            <EditTodoView todo={this.state.newTodo} onChange={this.handleAddChange}  onDatePick={this.onNewDatePick} />
                        </Row>
                        <Row>
                            <Col><Button className="submit_btn" onClick={this.onNewTodo}>Add Todo</Button>
                                <Button className="cancel" bsStyle="link" onClick={()=>this.mode[0]="list"}>Cancel</Button></Col>
                        </Row>
                        </span>
                    }
                    </Grid>
                </div>
        );
    }

    onNewTodo = () => {
        const store = this.props.store;
        store.addTodo(this.state.newTodo);
        this.resetNewTodo();
    };

    onEditTodo = (i) => {
        return () => {
            const store = this.props.store;
            store.setTodo(i,this.state.editingTodo);
            this.mode[0] = "list";
        }
    };

    onDelTodo = (i) => {
        return () => {
            const store = this.props.store;
            store.delTodo(i);
            this.mode[0] = "list";
        }
    };

    onNewDatePick = (value, formattedValue) => {
        const todo = Object.assign({}, this.state.newTodo);
        const editingTodo = this.state.editingTodo;
        todo.expire_date = formattedValue;
        this.setState({newTodo: todo,editingTodo: editingTodo});
    };

    onEditDatePick = (value, formattedValue) => {
        const todo = Object.assign({}, this.state.editingTodo);
        const newTodo = this.state.newTodo;
        todo.expire_date = formattedValue;
        this.setState({ newTodo: newTodo, editingTodo: todo });
    }

    handleCheck = (i) => {
        return () => {
            const store = this.props.store;
            const todo = this.props.store.todos[i];
            todo.finished = !todo.finished;
            store.setTodo(i,todo);
        }
    }

    handleAddChange = (e,info) => {
        const todo = Object.assign({}, this.state.newTodo);
        const editingTodo = this.state.editingTodo;
        todo[info] = e.target.value;
        this.setState({newTodo: todo,editingTodo: editingTodo});
    };

    handleEditChange = (e, info) => {
        const todo = Object.assign({}, this.state.editingTodo);
        const newTodo = this.state.newTodo;
        todo[info] = e.target.value;
        this.setState({
            newTodo: newTodo,
            editingTodo: todo
        });
    };

    resetNewTodo = () => {
        const newTodo= Object.assign({}, this.defaultNewTodo);
        const editingTodo = this.state.editingTodo;
        this.setState({
            newTodo: newTodo,
            editingTodo: editingTodo
        });
    };
}

@observer
class SortView extends React.Component {
    render() {
        const store = this.props.store;
        return (
            <div>
                Sort by&nbsp;
                <ButtonGroup>
                    <Button onClick={()=>{store.sortBy="date";store.sortTodo();}}>Date</Button>
                    <Button onClick={()=>{store.sortBy="priority";store.sortTodo();}}>Priority</Button>
                </ButtonGroup>
            </div>
        )
    }
}

@observer
class TodoView extends React.Component {
    render() {
        const todo = this.props.todo;
        return (
            <tr>
                <td className="checkbox">
                    <Checkbox checked={todo.finished} onChange={this.props.onCheck}></Checkbox>
                </td><td className="content" onClick={this.props.onClick}>
                    {todo.content}
                </td><td className="expire-date" onClick={this.props.onClick}>
                    {todo.expire_date}
                </td><td className="priority" onClick={this.props.onClick}>
                    {todo.priority == 1 && <Label bsStyle="danger">H</Label>}
                    {todo.priority == 2 && <Label bsStyle = "warning" >M</Label>}
                    {todo.priority == 3 && <Label bsStyle="info">L</Label>}
                </td>
            </tr>
        );
    }

    onToggleCompleted = () => {
        const todo = this.props.todo;
        todo.completed = !todo.completed;
    };
}

class EditTodoView extends React.Component {
    render() {
        const todo = this.props.todo;
        const onChange = this.props.onChange;
        const onDatePick = this.props.onDatePick;
        return (
                <Col>
                < Form inline >
                <FormGroup>
                    <FormControl className="content-input" type="text" value={todo.content} onChange={(e) => onChange(e, "content")}></FormControl>
                </FormGroup>

                <FormGroup>
                        <DatePicker dateFormat="YYYY-MM-DD" value={todo.expire_date} onChange={onDatePick} showClearButton={false}/>
                </FormGroup>

                <FormGroup>
                        <FormControl componentClass="select" placeholder="Priority" value={todo.priority} onChange={(e) => onChange(e, "priority")}>
                            <option value="1">High</option>
                            <option value="2">Midium</option>
                            <option value="3">Low</option>
                        </FormControl>
                </FormGroup>
                </Form>
                </Col>
        );
    }
}

class NavBarView extends React.Component {
    render() {
        return (
            <Navbar collapseOnSelect>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="#">DOIT</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight>
                        <NavItem eventKey={1} href="https://github.com/silencender/doit">GitHub</NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

ReactDOM.render(
    <TodoList store={todoStore} />,
    document.getElementById("root")
);
