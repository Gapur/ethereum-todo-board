import React, { useState } from 'react';
import { Modal, Button, Form } from 'semantic-ui-react';

const TodoListModal = ({ showModal, onSave, onClose }) => {
  const [values, setValues] = useState({});
  const onInputChange = (name, value) => {
    setValues({ ...values, [name]: value });
  };

  return (
    <Modal size="tiny" open={showModal} onClose={onClose}>
      <Modal.Header>Create a new task</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            label="Title"
            placeholder="Todo"
            onChange={e => onInputChange('title', e.target.value)}
          />
          <Form.Input
            label="Description"
            placeholder="Todo description"
            onChange={e => onInputChange('description', e.target.value)}
          />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={onClose}>
          Cancel
        </Button>
        <Button
          positive
          icon="checkmark"
          labelPosition="right"
          content="Create"
          onClick={() => onSave(values)}
        />
      </Modal.Actions>
    </Modal>
  );
};

export default TodoListModal;
