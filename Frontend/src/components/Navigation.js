import React from "react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
	return (
		<nav className="navbar navbar-expand navbar-dark bg-primary justify-content-center">
			<ul className="navbar-nav">
				<li className="nav-item">
					<NavLink
						to="/department-staff"
						className={({ isActive }) =>
							"nav-link" + (isActive ? " active" : "")
						}
					>
						Department Staff
					</NavLink>
				</li>
				<li className="nav-item">
					<NavLink
						to="/ta-committee"
						className={({ isActive }) =>
							"nav-link" + (isActive ? " active" : "")
						}
					>
						TA Committee Members
					</NavLink>
				</li>
			</ul>
		</nav>
	);
};

export default Navigation;
