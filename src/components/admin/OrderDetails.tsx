@@ .. @@
             onClick={() => onStatusUpdate(order.id, status)}
             className="px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-2"
           >
             <Loader2 className="animate-spin" size={16} />
-            Mark as processing
+            Process Order
           </button>
         );
       case 'completed':
@@ .. @@
             className="px-4 py-2 rounded-full text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors flex items-center gap-2"
           >
             <CheckCircle2 size={16} />
-            Mark as completed
+            Complete Order
           </button>
         );
       case 'cancelled':
@@ .. @@
             className="px-4 py-2 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2"
           >
             <XCircle size={16} />
-            Cancel order
+            Cancel Order
           </button>
         );