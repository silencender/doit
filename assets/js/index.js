import React from 'react';
import ReactDOM from 'react-dom';
import { observable, computed, autorun } from 'mobx';
import { observer } from 'mobx-react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';

class TodoStore {
    @observable todos = [];

    addTodo(todo) {
        todo.content != "" && todo.expireDate != "" && todo.priority!="" && this.todos.push({
            content: todo.content,
            finished: false,
            expireDate: todo.expireDate,
            priority: todo.priority
        });
    }
}


const todoStore = new TodoStore();

@observer
class TodoList extends React.Component {
    constructor(props) {
        super(props);
        this.defaultTodo = {
            content: "",
            expireDate: "",
            priority: "3",
        };
        this.state = {
            editingTodo: Object.assign({}, this.defaultTodo),
        };
    }
    render() {
        const store = this.props.store;
        return (
            <Router>
                <div>
                    <ul>
                        {store.todos.map(
                            (todo, idx) => <TodoView todo={todo} key={idx} />
                        )}
                    </ul>
                    <Route exact path="/" render={() => <div>
                                                            <Link to="/add">Add Todo</Link>
                                                        </div>} />
                    <Route path="/add" render={() =>
                                                    <div>
                                                        <AddTodoView todo={this.state.editingTodo} onChange={this.handleChange}/>
                                                        <button onClick={this.onNewTodo}>Add Todo</button>
                                                        <Link to="/">Cancel</Link>
                                                    </div>} />
                </div>
            </Router>
        );
    }

    onNewTodo = () => {
        const store = this.props.store;
        store.addTodo(this.state.editingTodo);
        this.resetNewTodo();
    }

    handleChange = (e,info) => {
        const todo = Object.assign({}, this.state.editingTodo);
        todo[info] = e.target.value;
        this.setState({editingTodo: todo});
    }

    resetNewTodo = () => {
        this.setState({ editingTodo: this.defaultTodo});
    }
}

@observer
class TodoView extends React.Component {
    render() {
        const todo = this.props.todo;
        return (
            <li>
                <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={this.onToggleCompleted}
                />
                {todo.content}
                {todo.expireDate}
                {todo.priority}
            </li>
        );
    }

    onToggleCompleted = () => {
        const todo = this.props.todo;
        todo.completed = !todo.completed;
    }
}

class AddTodoView extends React.Component {
    render() {
        const todo = this.props.todo;
        const onChange = this.props.onChange;
        return (
            <li>
                <input type="text" value={todo.content} onChange={(e) => onChange(e,"content")}/>
                <input type="text" value={todo.expireDate} onChange={(e) => onChange(e, "expireDate")}/>
                <input type="text" value={todo.priority} onChange={(e) => onChange(e, "priority")}/>
            </li>
        );
    }
}

ReactDOM.render(
    <TodoList store={todoStore} />,
    document.getElementById("root")
);
