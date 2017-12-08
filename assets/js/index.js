import React from 'react';
import ReactDOM from 'react-dom';
import { observable, autorun } from 'mobx';
import { observer } from 'mobx-react';
import { Button, Grid, Row, Col, Form, FormGroup, FormControl, Navbar, Nav, NavItem, Checkbox, Table } from 'react-bootstrap';
var DatePicker = require("react-bootstrap-date-picker");

import 'bootstrap/dist/css/bootstrap.css';
import '../css/style.css';

const api = "/api/";

class TodoStore {
    @observable todos = [];
    constructor() {
        fetch(api)
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        }).then(data => {
            this.todos = data;
        }).catch(error => {
            console.log(error);
        });
    }

    addTodo(todo) {
        todo.id != null && todo.content != "" && todo.expireDate != "" && todo.priority!="" &&
            fetch(api, {
                method: 'post',
                body: JSON.stringify(todo)
            }).then(response => {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }
                    return response;
                }).then(data => {
                    this.todos.push({
                        id: todo.id,
                        content: todo.content,
                        finished: false,
                        expireDate: todo.expireDate,
                        priority: todo.priority
                    });
                }).catch(error => {
                    console.log(error);
                });

    }

    setTodo(i,todo) {
        todo.id != null && todo.content != "" && todo.expireDate != "" && todo.priority != "" && todo.finished != null &&
            fetch(api + parseInt(todo.id) + "/", {method: 'put'})
                .then(response => {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }
                    return response.json();
                }).then(data => {
                    this.todos[i] = todo
                }).catch(error => {
                    console.log(error);
                });
    }

    delTodo(i) {
        fetch(api + parseInt(todos[i].id + "/"), { method: 'delete' })
            .then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
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
        this.id = 0;
        for (const todo in this.props.store.todos) {
            this.id <= todo.id && (this.id = todo.id + 1);
        }
        this.defaultNewTodo = {
            id: this.id,
            content: "",
            expireDate: new Date().toISOString(),
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
                        {store.todos.map(
                            (todo, idx) => 
                            <Row>
                                <Table key={todo.id} condensed={true}>
                                <tbody>
                                {
                                    (this.mode[0] == "list" || this.mode[0] == "add" || (this.mode[0] == "edit" && this.mode[1] != idx)) &&
                                    < TodoView todo = {todo}
                                    onClick = {() => {
                                            this.mode = ["edit",idx];
                                            const newTodo = this.state.newTodo;
                                            this.setState({
                                                newTodo: newTodo,
                                                editingTodo: Object.assign({}, todo)});
                                        }
                                    }
                                    />
                                }
                                {                                                
                                    this.mode[0] == "edit" && this.mode[1] == idx &&
                                    <div>
                                        <EditTodoView todo={this.state.editingTodo} onChange={this.handleEditChange} onDatePick={this.onEditDatePick}/>
                                        <Button onClick={this.onEditTodo(idx)}>Save</Button>
                                        <Button onClick={()=>this.mode[0]="list"}>Cancel</Button>
                                        <Button onClick={this.onDelTodo(idx)}>Delete</Button>
                                    </div>
                                }
                                </tbody>
                                </Table>
                            </Row>
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
        this.id += 1;
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
        todo.expireDate = value;
        this.setState({newTodo: todo,editingTodo: editingTodo});
    };

    onEditDatePick = (value) => {
        const todo = Object.assign({}, this.state.editingTodo);
        const newTodo = this.state.newTodo;
        todo.expireDate = value;
        this.setState({ newTodo: newTodo, editingTodo: todo });
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
        newTodo.id = this.id;
        const editingTodo = this.state.editingTodo;
        this.setState({
            newTodo: newTodo,
            editingTodo: editingTodo
        });
    };
}

@observer
class TodoView extends React.Component {
    render() {
        const todo = this.props.todo;
        return (
            <tr>
                <td className="checkbox">
                    <Checkbox checked={todo.completed}></Checkbox>
                </td><td className="content" onClick={this.props.onClick}>
                    {todo.content}
                </td><td className="expire-date" onClick={this.props.onClick}>
                    {todo.expireDate}
                </td><td className="priority" onClick={this.props.onClick}>
                    {todo.priority}
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
                    <FormControl type="text" value={todo.content} onChange={(e) => onChange(e, "content")}></FormControl>
                </FormGroup>

                <FormGroup>
                    <DatePicker dateFormat="YYYY/MM/DD" value={todo.expireDate} onChange={onDatePick} showClearButton={false}/>
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
