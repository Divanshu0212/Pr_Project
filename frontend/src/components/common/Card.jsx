import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types'; // Import PropTypes
import './Card.css';

const Card = ({
  post,
  children,
  variant = 'default',
  className = '',
  onClick = null,
  elevation = 'medium',
}) => {
  if (post) {
    return (
      <div className="card">
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
      className={`
        card
        card-${variant}
        card-elevation-${elevation}
        ${onClick ? 'card-clickable' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  post: PropTypes.shape({ // Define the shape of the 'post' prop
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
};

export default Card;