// module.exports = {
//   up: async (queryInterface, Sequelize) => {

//     await queryInterface.addColumn('user', 'gender', {
//       type: Sequelize.STRING,
//       allowNull: true,
//     });
//   },

//   down: async (queryInterface, Sequelize) => {

//     await queryInterface.removeColumn('user', 'gender');
//   },
// };


module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('User', 'address', {
        type: Sequelize.STRING,
        allowNull: true,
      });
  
      await queryInterface.addColumn('User', 'gender', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('User', 'address');
      await queryInterface.removeColumn('User', 'gender');
    }
  };
  