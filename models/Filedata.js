//Create user schema using passportlocalmongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Filedata = new Schema({
  new_agreementnumber : String,
  new_effectivedate : String,
  new_expirydate : String,
  new_settlementdate : String,
  new_jurprov : String,
  new_jurisdictioncode : String,
  new_employeecount : String,
  new_naicscodeid_firsttwodigit : String,
  new_publicprivate : String,
  new_naicscodeid : String,
  new_summaryreportavailabilityindicator : String,
  new_province : String,
  new_provinceenglish : String,
  new_provincefrench : String,
  new_citynameenglish : String,
  new_citynamefrench : String,
  new_cityprovincenameenglish : String,
  new_cityprovincenamefrench : String,
  new_unionid : String,
  new_unionnameenglish : String,
  new_unionnamefrench : String,
  new_affiliationtext : String,
  new_unionacronymenglish : String,
  new_unionacronymfrench : String,
  new_noccodeid : String,
  new_name_e : String,
  new_name_f : String,
  new_companyofficialnameeng : String,
  new_companyofficialnamefra : String,
  new_currentagreementindicator: String
});

module.exports = mongoose.model('Filedata', Filedata);