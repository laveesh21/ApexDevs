import PropTypes from 'prop-types';

/**
 * SidebarSection - Wrapper component for sidebar sections
 * Provides consistent spacing and optional dividers
 */
function SidebarSection({ title, children, showDivider = false }) {
  return (
    <div className={`${showDivider ? 'border-t border-neutral-700 pt-6 mt-6' : ''}`}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {title}
        </h3>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

SidebarSection.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  showDivider: PropTypes.bool
};

export default SidebarSection;
