import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const PrivateRoute = ({ element, loginPath }) => {
	const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
	return isLoggedIn ? element : <Navigate to={loginPath} replace />;
};

export default PrivateRoute;
