// import viteLogo from '/vite.svg'
// import global from 'global';
import * as process from "process";
global.process = process;
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom';
import { SignInPage } from '@/pages/sign_in_page';
import { SignUpPage } from '@/pages/sign_up_page';
import { PrivateRoute } from '@/components/private_route';
import { InvitationListPage, RoomChatPage } from './pages';
import { VideoConferencePage } from './pages/video_conference_page/page';
import { HomeLayout } from './layouts/home_layout';

function App() {

  return (
    <Routes>
      <Route path="/" element={<SignInPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path='/' element={<PrivateRoute />}>
        <Route path="/room-chat" element={
          <HomeLayout>
            <RoomChatPage />
          </HomeLayout>
        } />
        <Route path="/invitation" element={
          <HomeLayout>
            <InvitationListPage />
          </HomeLayout>
        } />
        <Route path="/video-call/:roomId" element={<VideoConferencePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  )
}

export default App
