import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const PrivateRoute = ({ element, loginPath, allowedRole }) => {
	const { isLoggedIn, user } = useAuthStore();
	if (!isLoggedIn) return <Navigate to={loginPath} replace />;
	if (allowedRole && user?.role !== allowedRole)
		return <Navigate to={loginPath} replace />;
	return element;
};

export default PrivateRoute;
