import { Provider } from 'react-redux';
import store from './store/index.ts';
import AppProvider from './components/app/AppProvider.tsx';
// import { AppRouter } from './router.tsx';
import { Toaster } from '@/components/ui/sonner';
import Spinner from '@/spinner.tsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './routes/Home.tsx';
import { HomePage } from './components/HomePage';
import './App.less';
import { AuthForbidden } from './router.tsx';
import Auth from './routes/Auth.tsx';
import SideBar from './components/Sidebar/SideBar.tsx';
const LoginCom = () => (
    <AuthForbidden>
        <Auth />
    </AuthForbidden>
);
function App() {
    return (
        <Provider store={store}>
            <Toaster />
            <Spinner />
            <AppProvider />
            <Router>
                <div className="app-wrapper">
                    <SideBar />
                    <div className="right-side-content">
                        <Routes>
                            <Route path="/chat" Component={Home} />
                            <Route path="/login" Component={LoginCom} />
                            <Route path="/home" Component={HomePage} />
                        </Routes>
                    </div>
                </div>
            </Router>
            {/* <AppRouter /> */}
        </Provider>
    );
}

export default App;
