import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({
  post,
  children,
  variant = 'default',
  className = '',
  onClick = null,
  elevation = 'medium',
  enableSpotlight = true,
}) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused || !enableSpotlight) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    if (!enableSpotlight) return;
    setIsFocused(true);
    setOpacity(0.4);
  };

  const handleBlur = () => {
    if (!enableSpotlight) return;
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    if (!enableSpotlight) return;
    setOpacity(0.3);
  };

  const handleMouseLeave = () => {
    if (!enableSpotlight) return;
    setOpacity(0);
  };

  const spotlightStyle = enableSpotlight ? {
    opacity,
    background: `radial-gradient(circle at ${position.x}px ${position.y}px, rgba(64, 224, 208, 0.15), transparent 70%)`,
  } : {};

  if (post) {
    return (
      <div 
        className="card card-post"
        ref={divRef}
        onMouseMove={handleMouseMove}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {enableSpotlight && (
          <div
            className="card-spotlight"
            style={spotlightStyle}
          />
        )}
        <Link className="link" to={`/post/${post.id}`}>
          <span className="title">{post.title}</span>
          {post.img && <img src={post.img} alt={post.title || "Card Image"} className="img" />}
          {post.desc && <p className="desc">{post.desc}</p>}
          <button className="cardButton">Read More</button>
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={divRef}
      className={`
        card
        card-${variant}
        card-elevation-${elevation}
        ${onClick ? 'card-clickable' : ''}
        ${className}
      `}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {enableSpotlight && (
        <div
          className="card-spotlight"
          style={spotlightStyle}
        />
      )}
      {children}
    </div>
  );
};

Card.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    img: PropTypes.string,
    desc: PropTypes.string,
  }),
  children: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'compact', 'flat', 'interactive']),
  className: PropTypes.string,
  onClick: PropTypes.func,
  elevation: PropTypes.oneOf(['low', 'medium', 'high']),
  enableSpotlight: PropTypes.bool,
};

export default Card;