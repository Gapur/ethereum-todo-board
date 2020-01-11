pragma solidity >=0.4.21 <0.7.0;

contract TodoList {
  uint public taskCount = 0;

  mapping(uint => Task) public tasks;

  constructor() public {
    createTask("Welcome Ethereum-Todo-Board", "Get Started");
  }

  struct Task {
    uint id;
    string title;
    string description;
    bool completed;
  }

  event TaskCreated(
    uint id,
    string title,
    string description,
    bool completed
  );

  function createTask(string memory _title, string memory _desc) public {
    taskCount ++;
    tasks[taskCount] = Task(taskCount, _title, _desc, false);
    emit TaskCreated(taskCount,  _title, _desc, false);
  }

  event TaskCompleted(
    uint id,
    bool completed
  );

  function toggleCompleted(uint _id) public {
    Task memory _task = tasks[_id];
    _task.completed = !_task.completed;
    tasks[_id] = _task;
    emit TaskCompleted(_id, _task.completed);
  }
}
