using Fastnet.Core;
using Fastnet.QPara.Data;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.QPara
{
    public class ChangeRecord
    {
        public DateTimeOffset Time { get; set; }
        public string By { get; set; }
        public string Description { get; set; }
        public bool RecordForNewMember { get; set; }
    }
    public static partial class dtoExtensions
    {
        public static List<ChangeRecord> FromDTO(this Member member, IEnumerable<NoteDTO> nlist, string userName)
        {
            var changes = new List<ChangeRecord>();
            if (nlist != null && nlist.Count() > 0)
            {
                Debug.Assert(nlist.Count() >= member.MemberNotes.Count());
                foreach (var n in nlist.Where(x => x.Id == 0))
                {
                    var newNote = new Note
                    {
                        CreatedOn = n.CreatedOn.StripTimeAndZone(),
                        UserName = userName
                    };
                    var mn = new MemberNote { Member = member, Note = newNote };
                    member.MemberNotes.Add(mn);
                    foreach (var nl in n.NoteLines.OrderBy(x => x.Index))
                    {
                        newNote.NoteLines.Add(new NoteLine { Note = newNote, Index = nl.Index, Line = nl.Line });
                    }
                    changes.Add(new ChangeRecord { Time = DateTimeOffset.Now, By = userName, Description = $"new member note added" });
                }
            }
            return changes;
        }
        public static List<ChangeRecord> FromDTO(this Payment payment, IEnumerable<NoteDTO> nlist, string userName)
        {
            var changes = new List<ChangeRecord>();
            if ((nlist != null && nlist.Count() > 0))
            {
                Debug.Assert(nlist.Count() >= payment.PaymentNotes.Count());
                //var startAt = payment.PaymentNotes.Select(x => x.Note).Select(x => x.CreatedOn).Max();
                //foreach (var n in nlist.Where(x => x.CreatedOn > startAt).OrderBy(x => x.CreatedOn))
                foreach (var n in nlist.Where(x => x.Id == 0))
                {
                    var newNote = new Note
                    {
                        CreatedOn = n.CreatedOn.StripTimeAndZone(),
                        UserName = userName
                    };
                    var pn = new PaymentNote { Payment = payment, Note = newNote };
                    payment.PaymentNotes.Add(pn);
                    foreach (var nl in n.NoteLines.OrderBy(x => x.Index))
                    {
                        newNote.NoteLines.Add(new NoteLine { Note = newNote, Index = nl.Index, Line = nl.Line });
                    }
                    changes.Add(new ChangeRecord { Time = DateTimeOffset.Now, By = userName, Description = $"new payment note added" });
                }
            }
            return changes;
        }
        public static List<ChangeRecord> FromDTO(this Payment payment, PaymentDTO dto, string userName)
        {
            var changes = new List<ChangeRecord>();
            if (dto != null)
            {
                Debug.Assert(payment.Id == dto.Id);
                //payment.DueDate = Compare(changes, payment.DueDate, dto.DueDate, userName, "payment due date changed from", true).StripTimeAndZone();
                //payment.AmountDue = Compare(changes, payment.AmountDue, dto.AmountDue, userName, "payment amount due changed from", true);
                payment.SubscriptionYear = Compare(changes, payment.SubscriptionYear, dto.SubscriptionYear, userName, "subscription year changed from ", true);
                payment.ReceivedDate = Compare(changes, payment.ReceivedDate, dto.ReceivedDate, userName, $"{payment.SubscriptionYear} £{payment.AmountReceived} received date changed from", true);
                payment.AmountReceived = CompareMoney(changes, payment.AmountReceived, dto.AmountReceived, userName, $"{payment.SubscriptionYear} {payment.ReceivedDate.ToDefault()} amount received changed from", true);
                payment.Type = Compare(changes, payment.Type, dto.Type, userName, "payment type changed from", true);
                payment.IsPaid = Compare(changes, payment.IsPaid, dto.IsPaid, userName, "Is waived flag changed from", true);
                changes.AddRange(payment.FromDTO(dto.Notes, userName)); ;
                if (payment.ReceivedDate.HasValue)
                {
                    payment.ReceivedDate = payment.ReceivedDate.Value.StripTimeAndZone();
                }
            }
            return changes;
        }
        public static List<ChangeRecord> FromDTO(this Member member, IEnumerable<PaymentDTO> list, string userName)
        {
            var changes = new List<ChangeRecord>();
            if (list != null && list.Count() > 0)
            {
                var existingPayments = member.Payments.Where(x => list.Select(l => l.Id).Contains(x.Id));
                var deletedPayments = member.Payments.Where(x => !list.Select(l => l.Id).Contains(x.Id));
                var newPayments = list.Where(x => !member.Payments.Select(p => p.Id).Contains(x.Id));
                foreach (var item in deletedPayments)
                {
                    member.Payments.Remove(item);
                    changes.Add(new ChangeRecord
                    {
                        Time = DateTimeOffset.Now,
                        By = userName,
                        Description = $"payment received on {item.ReceivedDate.Format()}, amount {item.AmountReceived.Format()} deleted"
                    });
                }
                foreach (var item in newPayments)
                {
                    var np = new Payment
                    {
                        Member = member,
                        //DueDate = item.DueDate,
                        //AmountDue = item.AmountDue,
                        SubscriptionYear = item.SubscriptionYear,
                        ReceivedDate = item.ReceivedDate,
                        AmountReceived = item.AmountReceived,
                        Type = item.Type,
                        IsPaid = item.IsPaid,
                    };
                    foreach (var n in item.Notes)
                    {
                        var pn = new PaymentNote
                        {
                            Note = new Note { CreatedOn = n.CreatedOn.StripTimeAndZone() }
                        };
                        n.NoteLines.ToList().ForEach(x => pn.Note.NoteLines.Add(new NoteLine { Index = x.Index, Line = x.Line }));
                        np.PaymentNotes.Add(pn);
                    }
                    member.Payments.Add(np);
                    changes.Add(new ChangeRecord
                    {
                        Time = DateTimeOffset.Now,
                        By = userName,
                        RecordForNewMember = true,
                        Description = $"new payment added: Amount Received £{item.AmountReceived.Format()} for {item.SubscriptionYear}, received on {item.ReceivedDate.Format()}"
                    });
                }
                foreach (var item in existingPayments)
                {
                    var dto = list.Single(x => x.Id == item.Id);
                    changes.AddRange(item.FromDTO(dto, userName));
                }
            }
            return changes;
        }
        public static List<ChangeRecord> FromDTO(this Member member, MemberDTO dto, string userName)
        {

            var changes = new List<ChangeRecord>();
            if (dto != null)
            {
                Debug.Assert(member.Id == dto.Id);
                member.FirstName = Compare(changes, member.FirstName, dto.FirstName, userName, "first name changed from");
                member.LastName = Compare(changes, member.LastName, dto.LastName, userName, "last name changed from");
                member.Email = Compare(changes, member.Email, dto.Email, userName, "email changed from");
                member.SecondEmail = Compare(changes, member.SecondEmail, dto.SecondEmail, userName, "second email changed from");
                member.PhoneNumber = Compare(changes, member.PhoneNumber, dto.PhoneNumber, userName, "phone number changed from");
                member.MobileNumber = Compare(changes, member.MobileNumber, dto.MobileNumber, userName, "mobile number changed from");
                member.Flat = Compare(changes, member.Flat, dto.Flat, userName, "flat changed from");
                member.Address = Compare(changes, member.Address, dto.Address, userName, "address changed from");
                member.PostCode = Compare(changes, member.PostCode, dto.PostCode, userName, "post code changed from");
                member.ZoneNumber = Compare(changes, member.ZoneNumber, dto.ZoneNumber, userName, "zone number changed from");
                member.MemberCount = Compare(changes, member.MemberCount, dto.MemberCount, userName, "membership count changed from");
                member.IsAssociate = Compare(changes, member.IsAssociate, dto.IsAssociate, userName, "IsAssociate flag changed from");
                member.IsSuspended = Compare(changes, member.IsSuspended, dto.IsSuspended, userName, "IsSuspended flag changed from");
                member.SubscriptionPeriod = Compare(changes, member.SubscriptionPeriod, dto.SubscriptionPeriod, userName, "subscription period changed from");
                member.SubscriptionType = Compare(changes, member.SubscriptionType, dto.SubscriptionType, userName, "subscription type changed from");
                //member.MemberCount = Compare(changes, member.MemberCount, dto.MemberCount, userName, "member membership count changed from");
                member.JoinedOn = Compare(changes, member.JoinedOn, dto.JoinedOn, userName, "joined on date changed from");
                member.LeftOn = Compare(changes, member.LeftOn, dto.LeftOn, userName, "left on date changed from");

                member.LeavingReason = Compare(changes, member.LeavingReason, dto.LeavingReason, userName, "leaving reason changed from");
                member.PaymentMethod = Compare(changes, member.PaymentMethod, dto.PaymentMethod, userName, "payment method changed from");
                member.MinutesDeliveryMethod = Compare(changes, member.MinutesDeliveryMethod, dto.MinutesDeliveryMethod, userName, "minutes delivery method changed from");
                member.DeliveryNote = Compare(changes, member.DeliveryNote, dto.DeliveryNote, userName, "delivery note changed from");

                changes.AddRange(member.FromDTO(dto.Notes, userName));
                changes.AddRange(member.FromDTO(dto.Payments, userName));
                if (member.JoinedOn.HasValue)
                {
                    member.JoinedOn = member.JoinedOn.Value.StripTimeAndZone();
                }
                if (member.LeftOn.HasValue)
                {
                    member.LeftOn = member.LeftOn.Value.StripTimeAndZone();
                }
            }
            return changes;
        }
        private static string ToDefault(this DateTimeOffset? date)
        {
            return date.HasValue ? date.Value.ToDefault() : "(none)";
        }
        private static int CompareMoney(List<ChangeRecord> changes, int l, int r, string userName, string descriptor, bool recordForNew = false)
        {

            if (l != r)
            {
                changes.Add(new ChangeRecord
                {
                    RecordForNewMember = recordForNew,
                    Time = DateTimeOffset.Now,
                    By = userName,
                    Description = $"{descriptor} £{l.Format()} to £{r.Format()}"
                });
                return r;
            }
            else
            {
                return l;
            }
        }
        private static T Compare<T>(List<ChangeRecord> changes, T l, T r, string userName, string descriptor, bool recordForNew = false)
        {

            //if (!EqualityComparer<T>.Default.Equals(l, r) && !(l.Format() == r.Format()))
            if (l.Format() != r.Format())
            {
                changes.Add(new ChangeRecord
                {
                    RecordForNewMember = recordForNew,
                    Time = DateTimeOffset.Now,
                    By = userName,
                    Description = $"{descriptor} {l.Format()} to {r.Format()}"
                });
                return r;
            }
            else
            {
                return l;
            }
        }
        private static string Format<T>(this T val)
        {
            if (val == null)
            {
                return "(none)";
            }
            switch (val)
            {
                default:
                    var t = val.ToString().Trim();
                    return t == string.Empty ? "(none)" : t;// val.ToString();
                case DateTimeOffset dt:
                    return dt.ToDefault();
            }
        }
    }
}
