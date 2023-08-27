import reactLogo from '@/assets/react.svg'
import { Button, Divider } from "..";
import { MenuItem } from "./menu_item";
import { ArrowLeftOnRectangleIcon, UserGroupIcon, UserPlusIcon, } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LOGOUT } from '@/redux/actions';
import { AllReducer } from '@/redux/reducer';
import { UserModel } from '@/models/user_model';

export function Drawer() {
  const loginUser: UserModel | undefined = useSelector((state: AllReducer) => state.authState)?.user;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logout = () => {
    try {
      dispatch({
        type: LOGOUT
      });
      navigate("/signin");
    } catch {
      alert("error happended")
    }
  }

  return (
    <div className='hfull flex flex-col items-center'>
      {/* menu avatar */}
      <div className='flex flex-col items-center m-4'>
        <div className='w-[60px] aspect-square'>
          <img src={reactLogo} className='object-contain w-full' />
        </div>
        <div className=''>
          <p>Hello {loginUser?.name}</p>
        </div>
      </div>

      <Divider />

      <MenuItem
        label='Room Chat'
        icon={<UserGroupIcon />}
        pathName='/room-chat'
        onClick={() => navigate("/room-chat")}
      />
      <MenuItem
        label='Invitation List'
        icon={<UserPlusIcon />}
        pathName='/invitation'
        onClick={() => navigate("/invitation")}
      />
      <Button
        type='button'
        className='w-full flex flex-row justify-start items-center'
        onClick={logout}
      >
        <ArrowLeftOnRectangleIcon className='w-8 h-8 m-4' />
        <span className='text-lg'>Logout</span>
      </Button>
    </div>
  )
}