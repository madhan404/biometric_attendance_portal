module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('LeaveRequests', 'reason_Details', {
      type: Sequelize.TEXT,
      allowNull: false,  // Make sure this is correctly formatted
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('LeaveRequests', 'reason_Details');
  }
};
