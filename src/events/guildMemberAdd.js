const config = require('config');
module.exports = (kyo, svr, member, oldmemberdata) =>{
	if(member.bot == true){
		member.roles.push(config.get('kyonna').unverified);
					member.edit({
						roles: member.roles
					}).then().catch(err => {
						console.log("Failed to add new member to role", err);
					});
	}else{
		member.roles.push(config.get('kyonna').users);
			member.edit({
				roles: member.roles
			}).then().catch(err => {
				console.log("Failed to add new member to role", err);
			});
	}
}