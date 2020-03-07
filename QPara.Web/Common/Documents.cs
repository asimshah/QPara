using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.QPara
{
    //public enum Documents
    //{

    //    MembershipApplicationForm,
    //    StandingOrderForm,
    //    BankLetter
    //}
    public class DocumentInfo
    {
        //public static List<Document> List = new List<Document>()
        //{
        //    new Document { Id = Documents.MembershipApplicationForm, FullPath = "documents\\QPARA-membership-application-form.docx", MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
        //    new Document { Id = Documents.StandingOrderForm, FullPath = "documents\\QPARA-Standing Order Form.docx", MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
        //    new Document { Id = Documents.BankLetter, FullPath = "documents\\QPARA sample letter to a bank.docx", MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
        //};
        //public Documents Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string FullPath { get; set; }
        public string MimeType { get; set; }
    }

}
