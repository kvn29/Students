import React from 'react';
import { withRouter, Link} from 'react-router';


class Header extends React.Component
{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <nav className="navbar navbar-inverse navbar-fixed-top" role="navigation" id="header">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <Link className="navbar-brand" to="/" id="logo">
                        STUDENTS
                    </Link>
                </div>
                <div className="collapse navbar-collapse navbar-ex1-collapse">
                    <ul className="nav navbar-nav navbar-right top-nav" style={{marginTop: '8px', marginRight:'10px'}}>
                        <li>
                            <Link to="/" activeClassName="activeLink" className="headerLinks">
                                Accueil
                            </Link>
                        </li>
                        <li>
                            <Link to="/register" activeClassName="activeLink" className="headerLinks">
                                S'enregistrer
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}

export default withRouter(Header);
