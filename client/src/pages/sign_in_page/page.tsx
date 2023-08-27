import { useState } from "react";
import { Button } from "@/components/button";
import { ErrorText, FormInput } from "@/components/form";
import { Link } from "@/components/link";
import { LoginModel } from "@/models/login_model";
import { UserModel } from "@/models/user_model";
import { AllReducer } from "@/redux/reducer";
import { Formik, FormikProps } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { SERVICE_URL, USER_API } from "@/constants/api_constants";
import { useNavigate } from "react-router-dom";
import { CLEAR_LOGIN_DATA, INIT_SOCKET, LOGIN_SUCCESS, SAVE_LOGIN_DATA } from "@/redux/actions";

export function SignInPage(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const initialValues: LoginModel = useSelector((state: AllReducer) => state.loginState)
  const [isRemember, setIsRemember] = useState(initialValues ? true : false);

  const signIn = async (loginData: LoginModel) => {
    try {
      const response = await fetch(`${SERVICE_URL}${USER_API}/signin`,
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData)
        });
      if (response.status == 200) {
        const responseData = await response.json();
        const user: UserModel = {
          id: responseData.user.id,
          email: loginData.email,
          name: responseData.user.name,
          roomList: responseData.user.roomList,
        }
        dispatch({
          type: INIT_SOCKET, data: user
        })
        dispatch({
          type: LOGIN_SUCCESS, data: {
            user: user,
            validUntil: new Date((new Date).getTime() + (responseData.validDuration * 60000)).getTime(), // duration in minutes
          }
        });
        if (isRemember) {
          dispatch({
            type: SAVE_LOGIN_DATA, data: {
              email: loginData.email,
              password: loginData.password
            }
          });
        } else {
          dispatch({
            type: CLEAR_LOGIN_DATA
          });
        }
        navigate("/room-chat");
      } else {
        alert("sign in fail");
      }
    } catch {
      alert("sign in fail");
    }
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Formik
        initialValues={initialValues}
        validate={values => {
          const errors: LoginModel = {};
          if (!values.email) {
            errors.email = 'Required';
          } else if (!values.password) {
            errors.password = 'Required';
          } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
          ) {
            errors.email = 'Invalid email address';
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(async () => {
            await signIn(values)
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
        }: FormikProps<UserModel>
        ) => (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[350px] h-fit">

            {/* <!-- Email input --> */}
            <label htmlFor="#email-input">Email address</label>
            <FormInput
              id="email-input"
              type="email"
              name="email"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
            />
            {errors.email && touched.email && <ErrorText value={errors.email} />}

            {/* <!--Password input--> */}
            <label htmlFor="#email-input">Password</label>
            <FormInput
              id="password-input"
              type="password"
              name="password"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
            />
            {errors.password && touched.password && <ErrorText value={errors.password} />}

            <div className="mb-6 flex items-center justify-between">
              {/* <!-- Remember me checkbox --> */}
              <div className="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
                <input
                  className="relative float-left -ml-[1.5rem] mr-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-neutral-300 outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                  type="checkbox"
                  value=""
                  checked={isRemember}
                  onChange={() => setIsRemember(!isRemember)}
                  id="rememberCheck"
                />
                <label
                  className="inline-block pl-[0.15rem] hover:cursor-pointer"
                  htmlFor="rememberCheck"
                >
                  Remember me
                </label>
              </div>

            </div>

            {/* <!-- Login button --> */}
            <div className="text-center lg:text-left">
              <Button type="submit" disabled={isSubmitting}>
                Login
              </Button>

              {/* <!-- Register link --> */}
              <p className="mb-0 mt-2 pt-1 text-sm font-semibold">
                Don't have an account?{" "}
                <Link label="Register" href="/signup" />
              </p>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}