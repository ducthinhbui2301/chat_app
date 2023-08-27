import { Button } from "@/components/button";
import { ErrorText, FormInput } from "@/components/form";
import { Link } from "@/components/link";
import { SERVICE_URL, USER_API } from "@/constants/api_constants";
import { UserModel } from "@/models/user_model";
import { SAVE_LOGIN_DATA } from "@/redux/actions";
import { Formik, FormikProps } from "formik";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export function SignUpPage(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues: UserModel = {
    email: '',
    name: '',
    password: ''
  };

  const signUp = async (signUpData: UserModel) => {
    try {
      const response = await fetch(`${SERVICE_URL}${USER_API}/signup`,
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signUpData)
        });
      if (response.status == 200) {
        alert("successfully, please login with your ID");
        navigate("/signin");
        dispatch({
          type: SAVE_LOGIN_DATA, data: {
            email: signUpData.email,
            password: signUpData.password
          }
        });
      } else {
        alert("sign up fail");
      }
    } catch {
      alert("sign up fail");
    }
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Formik
        initialValues={initialValues}
        validate={values => {
          const errors: UserModel = {};
          if (!values.email) {
            errors.email = 'Required';
          } else if (!values.name) {
            errors.name = 'Required';
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
            await signUp(values);
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

            {/* <!-- Name input --> */}
            <label htmlFor="#name-input">Full Name</label>
            <FormInput
              id="name-input"
              type="name"
              name="name"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.name}
            />
            {errors.name && touched.name && <ErrorText value={errors.name} />}

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

            {/* <!-- Login button --> */}
            <div className="text-center lg:text-left">
              <Button type="submit" disabled={isSubmitting} >
                Signup
              </Button>

              <p className="mb-0 mt-2 pt-1 text-sm font-semibold">
                Already have an account?{" "}
                <Link label="Sign In" href="/signin" />
              </p>
            </div>
          </form>
        )
        }
      </Formik>
    </div>
  );
}