import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Container, Header, Grid, Dimmer, Loader } from 'semantic-ui-react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Pane } from 'evergreen-ui';

import { AnimatedButton, Column, TodoListModal } from './components';
import { CONFIG, INITIAL, TODO, DONE } from './constants';
import { reorderSingleDrag } from './utils';

const App = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todoList, setTodoList] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [boardData, setBoardData] = useState(null);

  const onLoadBlockchainData = async () => {
    try {
      const web3 = new Web3(Web3.currentProvider || "http://localhost:7545");
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const todoList = new web3.eth.Contract(CONFIG.TODO_LIST_ABI, CONFIG.TODO_LIST_ADDRESS);
      setTodoList(todoList);
      const taskCount = await todoList.methods.taskCount().call();
      const tasks = {};
      for (var i = 1; i <= taskCount; i++) {
        const task = await todoList.methods.tasks(i).call()
        tasks[task.id] = task;
      }
      INITIAL.tasks = tasks;
      INITIAL.columns[TODO.id] = {
        ...TODO,
        taskIds: Object.keys(tasks).filter(id => !tasks[id].completed)
      };
      INITIAL.columns[DONE.id] = {
        ...DONE,
        taskIds: Object.keys(tasks).filter(id => tasks[id].completed)
      };
      setBoardData(INITIAL);
      setLoading(false);
    } catch (err) {
      console.log('err: ', err.message);
    }
  }

  useEffect(() => {
    onLoadBlockchainData();
  }, [loading]);

  const onDragEnd = (result) => {
    const destination = result.destination;
    const source = result.source;

    if (!destination || result.reason === 'CANCEL') {
      return;
    }

    onToggleCompleted(result.draggableId);

    const newBoardData = reorderSingleDrag({
      entities: boardData,
      source,
      destination,
    });
    setBoardData(newBoardData);
  };

  const onCreateTask = (formData) => {
    setLoading(true);
    todoList.methods
      .createTask(formData.title)
      .send({ from: account })
      .once('receipt', () => {
        setLoading(false);
        setShowModal(false);
      });
  }

  const onToggleCompleted = (taskId) => {
    setLoading(true);
    todoList.methods
      .toggleCompleted(taskId)
      .send({ from: account })
      .once('receipt', () => {
        setLoading(false);
      });
  }

  const getTasks = (entities, columnId) =>
    entities.columns[columnId].taskIds.map((taskId) => entities.tasks[taskId]);

  return (
    <Container textAlign="center">
      <Pane height={24} />
      <Header>Blockchain Todo Board Powered by Ethereum Smart Contracts</Header>
      {loading ? (
        <Dimmer active inverted><Loader /></Dimmer>
      ) : (
        <Pane marginBottom={16}>
          <AnimatedButton positive onClick={() => setShowModal(true)}>
            Create
          </AnimatedButton>
          <DragDropContext onDragEnd={onDragEnd}>
            <Grid centered padded>
              {boardData.columnOrder.map((columnId) => (
                <Column
                  column={boardData.columns[columnId]}
                  tasks={getTasks(boardData, columnId)}
                  key={columnId}
                />
              ))}
            </Grid>
          </DragDropContext>
        </Pane>
      )}
      <TodoListModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onSave={(formData) => onCreateTask(formData)}
      />
    </Container>
  );
}

export default App;
