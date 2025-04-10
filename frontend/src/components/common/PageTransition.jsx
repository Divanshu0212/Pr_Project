import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import '../../styles/animations.css';

const PageTransition = ({ children, location }) => {
  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={location.pathname}
        timeout={300}
        classNames="page"
        unmountOnExit
      >
        {children}
      </CSSTransition>
    </SwitchTransition>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,
    state: PropTypes.object,
    key: PropTypes.string.isRequired,
  }).isRequired,
};

export default PageTransition;