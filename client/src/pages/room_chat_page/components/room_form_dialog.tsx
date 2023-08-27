import { Button } from "@/components/button"
import { ErrorText, FormDialog, FormInput } from "@/components/form"
import { ROOM_API, SERVICE_URL } from "@/constants/api_constants"
import { RoomModel } from "@/models/room_model"
import { UserModel } from "@/models/user_model"
import { ALERT_ERROR, ALERT_SUCCESS, HIDE_ALERT } from "@/redux/actions"
import { Formik, FormikProps } from "formik"
import { useDispatch } from "react-redux"

export function RoomFormDialog(
  { openState, setOpen, loginUser, appendRoomList }:
    {
      openState: boolean,
      setOpen: (open: boolean) => void,
      loginUser: UserModel | undefined,
      appendRoomList: (room: RoomModel) => void,
    }
) {
  const dispatch = useDispatch();
  const initialValues: RoomModel = {
    name: '',
    userList: [],
    adminID: '',
  }

  const createRoom = async ({ name }: RoomModel, resetForm: () => void) => {
    try {
      if (loginUser?.id) {
        const data: RoomModel = {
          name: name,
          adminID: loginUser.id,
        }
        const response = await fetch(`${SERVICE_URL}${ROOM_API}/create`,
          {
            method: "POST",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
          });
        if (response.status == 201) {
          const responseData = await response.json();
          appendRoomList({ id: responseData.id, ...data });
          setOpen(false)
          resetForm();
          dispatch({
            type: ALERT_SUCCESS,
            data: "create room successfully"
          });
          setTimeout(() => {
            dispatch({
              type: HIDE_ALERT
            });
          }, 2500)

        } else {
          dispatch({
            type: ALERT_ERROR,
            data: "create room fail"
          });
          setTimeout(() => {
            dispatch({
              type: HIDE_ALERT
            });
          }, 2500)
        }
      }
    } catch {
      dispatch({
        type: ALERT_ERROR,
        data: "error happened"
      });
      setTimeout(() => {
        dispatch({
          type: HIDE_ALERT
        });
      }, 2500)
    }
  }

  return (
    <FormDialog
      openState={openState}
      setOpen={setOpen}
      title={"Create New Room"}
    >
      <Formik
        initialValues={initialValues}
        validate={values => {
          const errors: RoomModel = {};
          if (!values.name) {
            errors.name = 'Required';
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          setTimeout(async () => {
            await createRoom(values, resetForm)
            setSubmitting(false);
          }, 400);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }: FormikProps<RoomModel>
        ) => (
          <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-[350px] h-fit">
            {/* Name Input */}
            <label htmlFor="#email-input" className="mr-auto pl-1 mb-2">Room Name</label>
            <FormInput
              id="name-input"
              type="name"
              name="name"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.name}
              placeholder="Enter your room name here"
            />
            {errors.name && touched.name && <ErrorText value={errors.name} />}

            {/* Submit Button */}
            <div className="text-center lg:text-left w-full mt-8">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                Save
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </FormDialog>
  )
}