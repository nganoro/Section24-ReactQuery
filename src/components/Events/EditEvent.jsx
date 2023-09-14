import { Link, useNavigate, useParams, redirect, useSubmit } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  // const submit = useSubmit();
  const params = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({signal, id: params.id}),
    staleTime: 10000
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    /** optimistic update: updates data cached by updating backend*/
    onMutate: async (data) => {
      const newEvent = data.event;
      /** first data is one thats already fetched and cahced
       * second data in teh object is the new updated form*/
      await queryClient.cancelQueries({queryKey: ['events', params.id]});
      const previousEvent = queryClient.getQueryData(['events', params.id]);
      const updatedCacher = queryClient.setQueryData(['events', params.id], newEvent);

      console.log(updatedCacher);
      return { previousEvent }
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(['events', params.id], context.previousEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events', params.id]);
    }
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate('../');

    // SubmitEvent(formData, {method: 'PUT'});
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  /** no need cuz of loader */

  // if (isLoading) {
  //   content = (
  //     <div className='center'>
  //       <LoadingIndicator />
  //     </div>
  //   );
  // }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={ error.info?.message || 'Failed to Load event.'}
        />
        <div className="form-actions">
          <Link to="../" className='button'>
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    )
  }

  return (
    <Modal onClose={handleClose}>{content}</Modal>
  );
}

/** you still wannt keep useQuery becasue fetchQuery in the loader
 * will get the result n store it in the cache. So when useQuery is run 
 * above, it pulls from cache. and we can keep all the advantages
 */

export function loader({params}) {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({signal, id: params.id}),
  });
}

/** alternate to useMutation */

// export async function action({request, params}) {
//   const formData = await request.formData();
//   /** transforms it into a simply key value JS format */
//   const updatedEventData = Object.fromEntries(formData);
//   await updateEvent({ id: params.id, event: updatedEventData });
//   await queryClient.invalidateQueries(['events'])
//   return redirect('../');
// }
