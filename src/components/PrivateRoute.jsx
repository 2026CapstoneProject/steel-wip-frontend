import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element, loginPath, useStore }) => {
	const isLoggedIn = useStore((s) => s.isLoggedIn);
	return isLoggedIn ? element : <Navigate to={loginPath} replace />;
};

export default PrivateRoute;
