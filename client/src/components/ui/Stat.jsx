import PropTypes from 'prop-types';

/**
 * Stat Component - Reusable component for displaying icons with text/numbers
 * Used for comments, views, likes, and other statistics
 * @param {node} icon - SVG icon element
 * @param {string|number} value - The numeric value or count
 * @param {string} text - Optional text label (e.g., "comments", "views")
 * @param {string} className - Additional custom classes
 */
function Stat({ icon, value, text, className = '' }) {
  return (
    <span className={`flex items-center gap-1.5 text-gray-400 ${className}`}>
      {icon}
      {value !== undefined && value !== null ? (
        <>
          {value} {text}
        </>
      ) : (
        text && text
      )}
    </span>
  );
}

Stat.propTypes = {
  icon: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  text: PropTypes.string,
  className: PropTypes.string
};

export default Stat;
