import { Link, useNavigate } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useMutation } from '@tanstack/react-query';

import { createNewEvent } from '../../util/http';
import { queryClient } from '../../util/http';

export default function NewEvent() {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    /**a very efficient way of mutating, fetching and updating data below */
    onSuccess: () => {
      /** will invalidate any query with that key */
      queryClient.invalidateQueries({queryKey: ['events']});
      navigate('/events');
    }
  });

  function handleSubmit(formData) {
    /**object with even property is so it matches backend data format */
    mutate({event: formData});
    navigate('/events');
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && 'Submitting...'}
        {!isPending && (
        <>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Create
          </button>
        </>
        )}
      </EventForm>
      {isError && 
        <ErrorBlock
          title="Failed to create event"
          message={error.info?.message || 'Failed to create event. Please check your form'}/>
      }
    </Modal>
  );
}
